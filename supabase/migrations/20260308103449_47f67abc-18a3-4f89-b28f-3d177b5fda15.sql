
-- Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  user_goal TEXT CHECK (user_goal IN ('student', 'career_switcher', 'consultant')),
  company_name TEXT,
  company_logo_url TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- SUBSCRIPTIONS
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'elite')),
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  trial_ends_at TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own subscription" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- USAGE LOGS
CREATE TABLE public.usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  period_month TEXT NOT NULL,
  count INT DEFAULT 0,
  UNIQUE(user_id, action, period_month)
);

ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own usage" ON public.usage_logs
  FOR SELECT USING (auth.uid() = user_id);

-- INCREMENT USAGE RPC
CREATE OR REPLACE FUNCTION public.increment_usage(
  p_user_id UUID, p_action TEXT, p_period_month TEXT
) RETURNS void AS $$
BEGIN
  INSERT INTO public.usage_logs (user_id, action, period_month, count)
  VALUES (p_user_id, p_action, p_period_month, 1)
  ON CONFLICT (user_id, action, period_month)
  DO UPDATE SET count = usage_logs.count + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- RESUMES
CREATE TABLE public.resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  raw_text TEXT NOT NULL,
  extracted_skills JSONB,
  detected_experience_level TEXT,
  detected_industry TEXT,
  strengths JSONB,
  weaknesses JSONB,
  overall_fit_score INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their resumes" ON public.resumes
  FOR ALL USING (auth.uid() = user_id);

CREATE TRIGGER update_resumes_updated_at
  BEFORE UPDATE ON public.resumes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- TARGET ROLES
CREATE TABLE public.target_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_title TEXT NOT NULL,
  industry TEXT,
  experience_level TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.target_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their target roles" ON public.target_roles
  FOR ALL USING (auth.uid() = user_id);

-- LEARNING PLANS
CREATE TABLE public.learning_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_role_id UUID REFERENCES public.target_roles(id) ON DELETE CASCADE,
  resume_id UUID REFERENCES public.resumes(id),
  total_skills INT DEFAULT 0,
  estimated_weeks INT,
  phase TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.learning_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their learning plans" ON public.learning_plans
  FOR ALL USING (auth.uid() = user_id);

-- PLAN STEPS
CREATE TABLE public.plan_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.learning_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  importance_level TEXT,
  phase TEXT,
  how_to_learn TEXT,
  resources JSONB,
  practical_tasks JSONB,
  estimated_weeks INT DEFAULT 2,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  completed_at TIMESTAMPTZ,
  sort_order INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.plan_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their plan steps" ON public.plan_steps
  FOR ALL USING (auth.uid() = user_id);

CREATE TRIGGER update_plan_steps_updated_at
  BEFORE UPDATE ON public.plan_steps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- INTERVIEW SESSIONS
CREATE TABLE public.interview_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interview_type TEXT CHECK (interview_type IN ('technical', 'behavioral', 'mixed', 'resume_based')),
  difficulty TEXT CHECK (difficulty IN ('junior', 'mid', 'senior')),
  target_role TEXT,
  overall_score DECIMAL(4,2),
  strengths JSONB,
  improvements JSONB,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their interview sessions" ON public.interview_sessions
  FOR ALL USING (auth.uid() = user_id);

-- INTERVIEW RESPONSES
CREATE TABLE public.interview_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  score DECIMAL(3,1),
  feedback TEXT,
  ideal_elements JSONB,
  question_number INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.interview_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their interview responses" ON public.interview_responses
  FOR ALL USING (auth.uid() = user_id);

-- SUPPORT SESSIONS
CREATE TABLE public.support_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  messages JSONB DEFAULT '[]',
  save_history BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.support_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their support sessions" ON public.support_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE TRIGGER update_support_sessions_updated_at
  BEFORE UPDATE ON public.support_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- SKILL GAPS
CREATE TABLE public.skill_gaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_role_id UUID REFERENCES public.target_roles(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  importance_level TEXT CHECK (importance_level IN ('critical', 'important', 'nice_to_have')),
  why_it_matters TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.skill_gaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their skill gaps" ON public.skill_gaps
  FOR ALL USING (auth.uid() = user_id);

-- PROGRESS LOGS
CREATE TABLE public.progress_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  step_id UUID REFERENCES public.plan_steps(id),
  action TEXT NOT NULL,
  notes TEXT,
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.progress_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their progress logs" ON public.progress_logs
  FOR ALL USING (auth.uid() = user_id);

-- AI RESPONSE CACHE (shared read, service role write)
CREATE TABLE public.ai_response_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT UNIQUE NOT NULL,
  response_json JSONB NOT NULL,
  use_case TEXT NOT NULL,
  hit_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX ON public.ai_response_cache(cache_key);
CREATE INDEX ON public.ai_response_cache(expires_at);

ALTER TABLE public.ai_response_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read cache" ON public.ai_response_cache
  FOR SELECT USING (auth.role() = 'authenticated');

-- Auto-create profile + subscription on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  
  INSERT INTO public.subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'free', 'active');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

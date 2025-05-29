import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthDatabase } from '@/hooks/useAuthDatabase';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const { loginWithEmail, loginWithGoogle, register, error } = useAuthDatabase();
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });

  const handleGoogleLogin = async () => {
    await loginWithGoogle();
    // Note: Firebase redirect will handle the login flow
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let success = false;
    
    if (isSignUp) {
      success = await register(formData.email, formData.password, formData.name);
    } else {
      success = await loginWithEmail(formData.email, formData.password);
    }
    
    if (success) {
      onLoginSuccess();
    }
  };

  if (showEmailForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-4">
        <Card className="w-full max-w-sm shadow-2xl">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent text-4xl font-bold mb-2">
                너이거돼?
              </div>
              <p className="text-neutral-500 text-sm">
                {isSignUp ? '새 계정 만들기' : '이메일로 로그인'}
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              {isSignUp && (
                <Input
                  type="text"
                  placeholder="이름"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              )}
              <Input
                type="email"
                placeholder="이메일"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <Input
                type="password"
                placeholder="비밀번호"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                {isSignUp ? '가입하기' : '로그인'}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-primary text-sm hover:underline"
              >
                {isSignUp ? '이미 계정이 있나요? 로그인' : '계정이 없나요? 가입하기'}
              </button>
            </div>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setShowEmailForm(false)}
                className="text-neutral-500 text-sm hover:underline"
              >
                ← 다른 방법으로 로그인
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-4">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent text-4xl font-bold mb-2">
              너이거돼?
            </div>
            <p className="text-neutral-500 text-sm">매일 새로운 챌린지와 함께 성장하세요</p>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <Button
              onClick={handleGoogleLogin}
              variant="outline"
              className="w-full border-2 border-gray-200 rounded-xl p-4 flex items-center justify-center space-x-3 hover:border-primary transition-colors"
            >
              <i className="fab fa-google text-red-500 text-xl"></i>
              <span className="font-medium text-neutral-600">Google로 시작하기</span>
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-neutral-500">또는</span>
              </div>
            </div>
            
            <Button
              onClick={() => setShowEmailForm(true)}
              className="w-full bg-primary text-white rounded-xl p-4 font-medium hover:bg-primary/90 transition-colors"
            >
              이메일로 시작하기
            </Button>
          </div>
          
          <p className="text-xs text-neutral-400 text-center mt-6">
            가입하면 <span className="text-primary">이용약관</span> 및 <span className="text-primary">개인정보처리방침</span>에 동의하게 됩니다
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

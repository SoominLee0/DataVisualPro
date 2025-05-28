import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Challenge } from '@shared/schema';
import { useChallenges } from '@/hooks/useChallenges';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface ChallengeSubmissionModalProps {
  challenge: Challenge | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: () => void;
}

type SubmissionType = 'video' | 'photo' | 'text' | 'emoji';

export function ChallengeSubmissionModal({ 
  challenge, 
  isOpen, 
  onClose, 
  onSubmitSuccess 
}: ChallengeSubmissionModalProps) {
  const { user } = useAuth();
  const { submitChallenge } = useChallenges();
  
  const [submissionType, setSubmissionType] = useState<SubmissionType>('video');
  const [isSuccess, setIsSuccess] = useState(true);
  const [textContent, setTextContent] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('💪');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emojis = ['💪', '🔥', '😤', '🎉', '😅', '👍', '⭐', '✨'];

  const submissionTypes = [
    { id: 'video', label: '동영상 촬영', icon: 'fas fa-video' },
    { id: 'photo', label: '사진 촬영', icon: 'fas fa-camera' },
    { id: 'text', label: '텍스트 입력', icon: 'fas fa-pen' },
    { id: 'emoji', label: '이모지 선택', icon: 'fas fa-smile' },
  ] as const;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!user || !challenge) return;

    setIsSubmitting(true);
    try {
      let content: string | File = '';

      switch (submissionType) {
        case 'video':
        case 'photo':
          if (!selectedFile) {
            alert('파일을 선택해주세요.');
            return;
          }
          content = selectedFile;
          break;
        case 'text':
          content = textContent;
          break;
        case 'emoji':
          content = selectedEmoji;
          break;
      }

      const submissionId = await submitChallenge(
        user.id,
        challenge.id,
        challenge.day,
        submissionType,
        content,
        isSuccess
      );

      if (submissionId) {
        onSubmitSuccess();
        onClose();
        resetForm();
      }
    } catch (error) {
      console.error('Failed to submit challenge:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmissionType('video');
    setIsSuccess(true);
    setTextContent('');
    setSelectedEmoji('💪');
    setSelectedFile(null);
  };

  if (!challenge) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-neutral-600">
            챌린지 인증하기
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Submission Type Selection */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-600 mb-3">인증 방식 선택</h3>
            <div className="grid grid-cols-2 gap-3">
              {submissionTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSubmissionType(type.id)}
                  className={cn(
                    "rounded-xl p-4 text-center transition-colors",
                    submissionType === type.id
                      ? "bg-primary text-white"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  )}
                >
                  <i className={`${type.icon} text-2xl mb-2`}></i>
                  <div className="text-sm font-medium">{type.label}</div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Submission Content Area */}
          <div>
            {/* Video Submission */}
            {submissionType === 'video' && (
              <div className="bg-neutral-100 rounded-xl p-8 text-center border-2 border-dashed border-neutral-300">
                <i className="fas fa-video text-4xl text-neutral-400 mb-4"></i>
                <p className="text-neutral-500 mb-4">동영상을 촬영하여 업로드하세요</p>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="video-upload"
                />
                <label htmlFor="video-upload">
                  <Button className="bg-primary text-white px-6 py-3 rounded-xl font-medium cursor-pointer">
                    <i className="fas fa-camera mr-2"></i>
                    {selectedFile ? selectedFile.name : '동영상 선택'}
                  </Button>
                </label>
              </div>
            )}
            
            {/* Photo Submission */}
            {submissionType === 'photo' && (
              <div className="bg-neutral-100 rounded-xl p-8 text-center border-2 border-dashed border-neutral-300">
                <i className="fas fa-camera text-4xl text-neutral-400 mb-4"></i>
                <p className="text-neutral-500 mb-4">사진을 촬영하여 업로드하세요</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="photo-upload"
                />
                <label htmlFor="photo-upload">
                  <Button className="bg-primary text-white px-6 py-3 rounded-xl font-medium cursor-pointer">
                    <i className="fas fa-camera mr-2"></i>
                    {selectedFile ? selectedFile.name : '사진 선택'}
                  </Button>
                </label>
              </div>
            )}
            
            {/* Text Submission */}
            {submissionType === 'text' && (
              <div>
                <Textarea 
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="챌린지를 어떻게 수행했는지 설명해주세요..."
                  className="w-full h-32 p-4 border border-neutral-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            )}
            
            {/* Emoji Submission */}
            {submissionType === 'emoji' && (
              <div className="text-center">
                <p className="text-sm text-neutral-600 mb-4">오늘의 기분을 이모지로 표현해주세요</p>
                <div className="grid grid-cols-4 gap-3">
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setSelectedEmoji(emoji)}
                      className={cn(
                        "text-4xl p-4 rounded-xl transition-colors",
                        selectedEmoji === emoji
                          ? "bg-primary text-white"
                          : "bg-neutral-100 hover:bg-neutral-200"
                      )}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Success/Failure Selection */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-600 mb-3">챌린지 결과</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setIsSuccess(true)}
                className={cn(
                  "rounded-xl p-4 text-center font-medium transition-colors",
                  isSuccess
                    ? "bg-success text-white"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                )}
              >
                <i className="fas fa-check-circle text-xl mb-1"></i>
                <div>성공!</div>
              </button>
              <button
                onClick={() => setIsSuccess(false)}
                className={cn(
                  "rounded-xl p-4 text-center font-medium transition-colors",
                  !isSuccess
                    ? "bg-red-500 text-white"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                )}
              >
                <i className="fas fa-times-circle text-xl mb-1"></i>
                <div>아쉽게 실패</div>
              </button>
            </div>
          </div>
          
          {/* Submit Button */}
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-primary to-secondary text-white rounded-xl p-4 font-semibold text-lg"
          >
            {isSubmitting ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                인증 중...
              </>
            ) : (
              '인증 완료하기'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

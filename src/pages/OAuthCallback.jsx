import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

function OAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const userParam = searchParams.get('user');
    const error = searchParams.get('error');

    if (error) {
      toast.error('Erreur de connexion OAuth');
      navigate('/login');
      return;
    }

    if (accessToken && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));
        
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
        
        toast.success(`Bienvenue ${user.name} !`);
        
        // Recharger pour mettre à jour le contexte Auth
        window.location.href = '/';
      } catch (err) {
        toast.error('Erreur lors de la connexion');
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex w-16 h-16 gradient-blue rounded-2xl items-center justify-center glow-blue mb-4 animate-pulse">
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-white text-lg">Connexion en cours...</p>
      </div>
    </div>
  );
}

export default OAuthCallback;
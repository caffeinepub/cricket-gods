import { Link, useNavigate } from '@tanstack/react-router';
import { Trophy, Home, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const year = new Date().getFullYear();
  const appId = encodeURIComponent(typeof window !== 'undefined' ? window.location.hostname : 'cricket-gods');

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-stadium-dark-border bg-stadium-dark-card/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/assets/generated/cricket-gods-logo.dim_256x256.png"
              alt="Cricket Gods"
              className="h-10 w-10 rounded-full object-cover"
            />
            <span className="font-display text-xl font-bold text-cricket-gold tracking-wider group-hover:text-cricket-gold-light transition-colors">
              CRICKET GODS
            </span>
          </Link>

          <nav className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: '/' })}
              className="text-muted-foreground hover:text-foreground hover:bg-stadium-dark-elevated"
            >
              <Home className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline">Matches</span>
            </Button>
            <Button
              size="sm"
              onClick={() => navigate({ to: '/match/new' })}
              className="bg-cricket-green hover:bg-cricket-green-light text-stadium-dark font-display font-semibold tracking-wide"
            >
              <PlusCircle className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline">New Match</span>
            </Button>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-stadium-dark-border bg-stadium-dark-card py-6 mt-8">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-cricket-gold" />
            <span className="font-display tracking-wide">CRICKET GODS</span>
            <span>© {year}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>Built with</span>
            <span className="text-wicket-red">♥</span>
            <span>using</span>
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cricket-gold hover:text-cricket-gold-light transition-colors font-medium"
            >
              caffeine.ai
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

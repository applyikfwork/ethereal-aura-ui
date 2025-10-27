import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Settings, Key, Image as ImageIcon, Users, Sparkles, Shield, TrendingUp, UserPlus } from 'lucide-react';
import { doc, getDoc, setDoc, collection, query, where, getDocs, getCountFromServer } from 'firebase/firestore';
import { db, storage } from '@/config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { AdminSettings } from '@shared/schema';
import ProtectedRoute from '@/components/ProtectedRoute';

function AdminPanel() {
  const { userData } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<AdminSettings>({
    faviconUrl: '',
    siteName: 'Aura Avatar Studio',
    allowSignups: true,
    defaultCredits: 10,
    premiumFeatures: {
      hdGeneration: true,
      styleVariations: true,
      unlimitedCredits: true,
    },
    updatedAt: new Date().toISOString(),
  });
  const [loading, setLoading] = useState(false);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    premiumUsers: 0,
    avatarsGenerated: 0,
    loading: true,
  });

  useEffect(() => {
    loadSettings();
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true }));
      
      // Count total users
      const usersCol = collection(db, 'users');
      const usersSnapshot = await getCountFromServer(usersCol);
      const totalUsers = usersSnapshot.data().count;
      
      // Count premium users
      const premiumQuery = query(usersCol, where('isPremium', '==', true));
      const premiumSnapshot = await getCountFromServer(premiumQuery);
      const premiumUsers = premiumSnapshot.data().count;
      
      // Count total avatars (you'll need to create an 'avatars' collection in Firestore)
      const avatarsCol = collection(db, 'avatars');
      const avatarsSnapshot = await getCountFromServer(avatarsCol);
      const avatarsGenerated = avatarsSnapshot.data().count;
      
      setStats({
        totalUsers,
        premiumUsers,
        avatarsGenerated,
        loading: false,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  const loadSettings = async () => {
    try {
      const settingsRef = doc(db, 'settings', 'admin');
      const settingsSnap = await getDoc(settingsRef);
      
      if (settingsSnap.exists()) {
        setSettings(settingsSnap.data() as AdminSettings);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };


  const handleFaviconUpload = async () => {
    if (!faviconFile) return;

    setLoading(true);
    try {
      const faviconRef = ref(storage, `admin/favicon.${faviconFile.name.split('.').pop()}`);
      await uploadBytes(faviconRef, faviconFile);
      const faviconUrl = await getDownloadURL(faviconRef);
      
      const settingsRef = doc(db, 'settings', 'admin');
      const updatedSettings = {
        ...settings,
        faviconUrl,
        updatedAt: new Date().toISOString(),
      };
      
      await setDoc(settingsRef, updatedSettings);
      setSettings(updatedSettings);
      
      // Update favicon in the document
      const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      link.href = faviconUrl;
      document.getElementsByTagName('head')[0].appendChild(link);
      
      toast({
        title: 'Favicon updated',
        description: 'Site favicon has been updated successfully',
      });
      
      setFaviconFile(null);
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      const settingsRef = doc(db, 'settings', 'admin');
      const updatedSettings = {
        ...settings,
        updatedAt: new Date().toISOString(),
      };
      
      await setDoc(settingsRef, updatedSettings);
      setSettings(updatedSettings);
      
      toast({
        title: 'Settings saved',
        description: 'All settings have been updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Failed to save',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Settings className="w-10 h-10 text-primary" />
          Admin Panel
        </h1>
        <p className="text-muted-foreground">
          Manage your Aura Avatar Studio settings and configurations
        </p>
      </div>

      <Tabs defaultValue="stats" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            API Setup
          </TabsTrigger>
          <TabsTrigger value="favicon" className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="api" className="space-y-4">
          <Card className="glass-card border-2 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-600" />
                Secure API Configuration
              </CardTitle>
              <CardDescription>
                API keys are securely managed through Replit Secrets for maximum security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  Gemini AI API Key (Prompt Enhancement)
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  For security reasons, the Gemini API key is stored as a Replit Secret. Gemini enhances avatar prompts but doesn't generate images directly.
                </p>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Get your API key from{' '}
                    <a
                      href="https://makersuite.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:underline font-medium"
                    >
                      Google AI Studio
                    </a>
                  </li>
                  <li>Go to the Replit Secrets tab (Tools → Secrets)</li>
                  <li>Add a new secret with key: <code className="bg-purple-100 dark:bg-purple-900 px-2 py-1 rounded">GEMINI_API_KEY</code></li>
                  <li>Paste your API key as the value</li>
                  <li>The application will use Gemini to enhance avatar prompts</li>
                </ol>
              </div>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Note:</strong> Gemini is an LLM and doesn't generate images directly. To enable real avatar generation, you need to integrate an image generation service (e.g., DALL-E, Stable Diffusion, or Imagen). The system currently uses enhanced prompts with placeholder avatars. Update <code className="bg-yellow-100 dark:bg-yellow-900 px-1 rounded">server/gemini.ts</code> to add your preferred image generation service.
                </p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-800 dark:text-green-200 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <strong>Security Best Practice:</strong> Never store API keys in your database or frontend code.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="favicon" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Site Favicon</CardTitle>
              <CardDescription>
                Upload a custom favicon for your site (recommended: 32x32 or 64x64 .ico, .png, or .svg)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {settings.faviconUrl && (
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Current Favicon:</p>
                  <img
                    src={settings.faviconUrl}
                    alt="Current favicon"
                    className="w-16 h-16"
                    data-testid="img-current-favicon"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="favicon">Upload New Favicon</Label>
                <Input
                  id="favicon"
                  type="file"
                  accept=".ico,.png,.svg"
                  onChange={(e) => setFaviconFile(e.target.files?.[0] || null)}
                  data-testid="input-favicon-upload"
                />
              </div>
              <Button
                onClick={handleFaviconUpload}
                disabled={!faviconFile || loading}
                data-testid="button-upload-favicon"
              >
                {loading ? 'Uploading...' : 'Upload Favicon'}
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Site Name</CardTitle>
              <CardDescription>Customize your site name</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  data-testid="input-site-name"
                />
              </div>
              <Button onClick={handleSaveSettings} disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure general application settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="defaultCredits">Default Credits for New Users</Label>
                <Input
                  id="defaultCredits"
                  type="number"
                  min="0"
                  value={settings.defaultCredits}
                  onChange={(e) =>
                    setSettings({ ...settings, defaultCredits: parseInt(e.target.value) })
                  }
                  data-testid="input-default-credits"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="allowSignups"
                  checked={settings.allowSignups}
                  onChange={(e) => setSettings({ ...settings, allowSignups: e.target.checked })}
                  className="w-4 h-4"
                  data-testid="checkbox-allow-signups"
                />
                <Label htmlFor="allowSignups">Allow new user signups</Label>
              </div>
              <Button onClick={handleSaveSettings} disabled={loading}>
                {loading ? 'Saving...' : 'Save Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="glass-card border-2 border-sky-200 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
                <Users className="w-5 h-5 text-sky-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-sky-600" data-testid="text-total-users">
                  {stats.loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    stats.totalUsers
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Registered accounts</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-2 border-purple-200 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Avatars Generated</CardTitle>
                <Sparkles className="w-5 h-5 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600" data-testid="text-avatars-generated">
                  {stats.loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    stats.avatarsGenerated
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Total creations</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-2 border-pink-200 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Premium Users</CardTitle>
                <UserPlus className="w-5 h-5 text-pink-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-pink-600" data-testid="text-premium-users">
                  {stats.loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    stats.premiumUsers
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.totalUsers > 0 ? `${Math.round((stats.premiumUsers / stats.totalUsers) * 100)}% conversion` : 'No users yet'}
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={loadStats}
                disabled={stats.loading}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Refresh Statistics
              </Button>
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => window.open('https://console.firebase.google.com/', '_blank')}
              >
                <Settings className="w-4 h-4 mr-2" />
                Open Firebase Console
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function Admin() {
  return (
    <ProtectedRoute adminOnly>
      <AdminPanel />
    </ProtectedRoute>
  );
}

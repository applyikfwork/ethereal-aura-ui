import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Settings, Key, Image as ImageIcon, Users, Sparkles } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, storage } from '@/config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { AdminSettings } from '@shared/schema';
import ProtectedRoute from '@/components/ProtectedRoute';

function AdminPanel() {
  const { userData } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<AdminSettings>({
    geminiApiKey: '',
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

  useEffect(() => {
    loadSettings();
  }, []);

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

  const handleSaveApiKey = async () => {
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
        title: 'API Key saved',
        description: 'Gemini API key has been updated successfully',
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

      <Tabs defaultValue="api" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="favicon" className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Stats
          </TabsTrigger>
        </TabsList>

        <TabsContent value="api" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Gemini AI API Key
              </CardTitle>
              <CardDescription>
                Configure your Google Gemini API key for AI-powered avatar generation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="geminiApiKey">API Key</Label>
                <Input
                  id="geminiApiKey"
                  type="password"
                  placeholder="Enter your Gemini API key"
                  value={settings.geminiApiKey || ''}
                  onChange={(e) => setSettings({ ...settings, geminiApiKey: e.target.value })}
                  data-testid="input-gemini-api-key"
                />
                <p className="text-sm text-muted-foreground">
                  Get your API key from{' '}
                  <a
                    href="https://makersuite.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Google AI Studio
                  </a>
                </p>
              </div>
              <Button
                onClick={handleSaveApiKey}
                disabled={loading}
                data-testid="button-save-api-key"
              >
                {loading ? 'Saving...' : 'Save API Key'}
              </Button>
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
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" data-testid="text-total-users">
                  Coming Soon
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Avatars Generated</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" data-testid="text-avatars-generated">
                  Coming Soon
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Premium Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" data-testid="text-premium-users">
                  Coming Soon
                </div>
              </CardContent>
            </Card>
          </div>
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

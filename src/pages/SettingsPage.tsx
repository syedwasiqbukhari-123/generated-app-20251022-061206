import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/hooks/useAuth';
import { useEmployeeStore } from '@/stores/employeeStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { Toaster, toast } from 'sonner';
import { UserCog } from 'lucide-react';
import { BackupRestoreCard } from '@/components/settings/BackupRestoreCard';
const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Invalid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.').optional().or(z.literal('')),
});
type ProfileFormValues = z.infer<typeof profileSchema>;
const brandingSchema = z.object({
  logoUrl: z.string().url('Please enter a valid URL.').or(z.literal('')),
});
type BrandingFormValues = z.infer<typeof brandingSchema>;
export function SettingsPage() {
  const user = useAuth((state) => state.user);
  const login = useAuth((state) => state.login);
  const { employees, fetchEmployees } = useEmployeeStore();
  const { logoUrl, fetchLogoUrl, updateLogoUrl, isLoading: isSettingsLoading } = useSettingsStore();
  const currentUser = employees.find(e => e.id === user?.id);
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: '', email: '', password: '' },
  });
  const brandingForm = useForm<BrandingFormValues>({
    resolver: zodResolver(brandingSchema),
    defaultValues: { logoUrl: '' },
  });
  useEffect(() => {
    if (!currentUser) {
      fetchEmployees();
    }
    fetchLogoUrl();
  }, [currentUser, fetchEmployees, fetchLogoUrl]);
  useEffect(() => {
    if (currentUser) {
      profileForm.reset({
        name: currentUser.name,
        email: currentUser.email,
        password: '',
      });
    }
  }, [currentUser, profileForm]);
  useEffect(() => {
    if (logoUrl) {
      brandingForm.reset({ logoUrl: logoUrl });
    }
  }, [logoUrl, brandingForm]);
  const onProfileSubmit = async (data: ProfileFormValues) => {
    if (!user?.id) {
      toast.error('User not found. Please log in again.');
      return;
    }
    const updateData: Partial<ProfileFormValues> = { name: data.name, email: data.email };
    if (data.password) {
      updateData.password = data.password;
    }
    try {
      const updatedUser = await fetch(`/api/employees/profile/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      }).then(res => res.json());
      if (!updatedUser.success) throw new Error(updatedUser.error || 'Failed to update profile');
      toast.success('Profile updated successfully!');
      if (user) login(user.id, updatedUser.data.name, updatedUser.data.role);
      profileForm.reset({ ...profileForm.getValues(), password: '' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast.error(errorMessage);
    }
  };
  const onBrandingSubmit = async (data: BrandingFormValues) => {
    await updateLogoUrl(data.logoUrl);
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Toaster richColors />
      <div className="py-8 md:py-10 lg:py-12">
        <div className="flex items-center gap-3 mb-8">
          <UserCog className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Settings</h1>
        </div>
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your account details here.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                    <FormField control={profileForm.control} name="name" render={({ field }) => ( <FormItem> <FormLabel>Full Name</FormLabel> <FormControl><Input placeholder="Your Name" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                    <FormField control={profileForm.control} name="email" render={({ field }) => ( <FormItem> <FormLabel>Email Address</FormLabel> <FormControl><Input type="email" placeholder="your.email@example.com" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                    <FormField control={profileForm.control} name="password" render={({ field }) => ( <FormItem> <FormLabel>New Password</FormLabel> <FormControl><Input type="password" placeholder="Leave blank to keep current" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                    <div className="flex justify-end">
                      <Button type="submit" disabled={profileForm.formState.isSubmitting}>
                        {profileForm.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Branding</CardTitle>
                <CardDescription>Set your company logo by providing a URL.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...brandingForm}>
                  <form onSubmit={brandingForm.handleSubmit(onBrandingSubmit)} className="space-y-6">
                    <FormField
                      control={brandingForm.control}
                      name="logoUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Logo URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/logo.png" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {logoUrl && (
                      <div>
                        <FormLabel>Current Logo Preview</FormLabel>
                        <div className="mt-2 p-4 border rounded-md flex justify-center items-center bg-muted/50">
                          <img src={logoUrl} alt="Logo Preview" className="h-16 w-auto object-contain" />
                        </div>
                      </div>
                    )}
                    <div className="flex justify-end">
                      <Button type="submit" disabled={isSettingsLoading}>
                        {isSettingsLoading ? 'Saving...' : 'Save Logo'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-8">
            <BackupRestoreCard />
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { updateEvent } from '@/actions/typeform-upload';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

export default function UpdateEventConfig() {
  const [eventId, setEventId] = useState('');
  const [typeformConfig, setTypeformConfig] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const handleUpdateConfig = async () => {
    if (!eventId || !typeformConfig) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please provide both Event ID and Typeform Config JSON',
      });
      return;
    }

    try {
      const parsedConfig = JSON.parse(typeformConfig);
      setIsLoading(true);
      setSuccess(false);

      await updateEvent(eventId, {
        typeform_config: parsedConfig,
      });

      setSuccess(true);
      toast({
        title: 'Success!',
        description: 'Event typeform_config has been updated successfully.',
      });
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to update event config. Please check your JSON format.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Update Event Typeform Config</CardTitle>
          <CardDescription>
            Update the typeform_config for an existing event (e.g., Foundathon
            3.0)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {success && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription>
                The event configuration has been updated successfully.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="eventId">Event ID</Label>
              <Input
                id="eventId"
                placeholder="Enter the event UUID"
                value={eventId}
                onChange={e => setEventId(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Find the event ID from the admin events table or database
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="typeformConfig">Typeform Config (JSON)</Label>
              <Textarea
                id="typeformConfig"
                placeholder='[{"id": "field1", "label": "Full Name", "type": "text", ...}, ...]'
                value={typeformConfig}
                onChange={e => setTypeformConfig(e.target.value)}
                rows={20}
                className="font-mono text-sm"
              />
              <p className="text-sm text-muted-foreground">
                Paste the typeform_config JSON array here. Make sure it&apos;s
                valid JSON.
              </p>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>
                    Each field should have an{' '}
                    <code className="bg-muted px-1 rounded">id</code> (unique
                    identifier)
                  </li>
                  <li>
                    Each field should have a{' '}
                    <code className="bg-muted px-1 rounded">label</code>{' '}
                    (display name)
                  </li>
                  <li>The JSON must be a valid array of field objects</li>
                  <li>
                    This will map field IDs in registrations to their proper
                    labels
                  </li>
                </ul>
              </AlertDescription>
            </Alert>

            <Button
              onClick={handleUpdateConfig}
              disabled={isLoading || !eventId || !typeformConfig}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Config'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Example Typeform Config</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
            {`[
  {
    "id": "fullName",
    "label": "Full Name",
    "type": "text",
    "required": true
  },
  {
    "id": "email",
    "label": "Email Address", 
    "type": "email",
    "required": true
  },
  {
    "id": "department",
    "label": "Department",
    "type": "select",
    "options": ["CSE", "ECE", "ME", "Other"]
  }
]`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}

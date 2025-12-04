import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Signup endpoint
app.post('/make-server-81a513d4/signup', async (c) => {
  try {
    const { name, email, password } = await c.req.json();

    if (!name || !email || !password) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true,
    });

    if (error) {
      console.error('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ user: data.user });
  } catch (error: any) {
    console.error('Signup error:', error);
    return c.json({ error: error.message || 'Signup failed' }, 500);
  }
});

// Get all events
app.get('/make-server-81a513d4/events', async (c) => {
  try {
    const events = await kv.getByPrefix('event:');
    
    // Get certificate counts for each event
    const eventsWithCounts = await Promise.all(
      events.map(async (event: any) => {
        const certificates = await kv.getByPrefix(`cert:${event.id}:`);
        return {
          ...event,
          certificateCount: certificates.length,
        };
      })
    );

    // Calculate stats
    const totalCertificates = await kv.getByPrefix('cert:');
    const totalDelivered = totalCertificates.filter(
      (cert: any) => cert.status === 'delivered'
    ).length;

    return c.json({
      events: eventsWithCounts,
      stats: {
        totalEvents: events.length,
        totalCertificates: totalCertificates.length,
        totalDelivered,
      },
    });
  } catch (error: any) {
    console.error('Error fetching events:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Create new event
app.post('/make-server-81a513d4/events', async (c) => {
  try {
    const { name, description, date, organizer, eventType } = await c.req.json();

    if (!name || !description || !date || !organizer) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const eventId = crypto.randomUUID();
    const event = {
      id: eventId,
      name,
      description,
      date,
      organizer,
      eventType: eventType || 'free',
      createdAt: new Date().toISOString(),
    };

    await kv.set(`event:${eventId}`, event);

    return c.json({ event });
  } catch (error: any) {
    console.error('Error creating event:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get certificates for a specific event
app.get('/make-server-81a513d4/certificates/:eventId', async (c) => {
  try {
    const eventId = c.req.param('eventId');
    const certificates = await kv.getByPrefix(`cert:${eventId}:`);

    // Sort by creation date (newest first)
    certificates.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return c.json({ certificates });
  } catch (error: any) {
    console.error('Error fetching certificates:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Generate certificates and send emails
app.post('/make-server-81a513d4/generate-certificates', async (c) => {
  try {
    const { eventId, participants } = await c.req.json();

    if (!eventId || !participants || !Array.isArray(participants)) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Get event details
    const event = await kv.get(`event:${eventId}`);
    if (!event) {
      return c.json({ error: 'Event not found' }, 404);
    }

    let generated = 0;

    // Generate certificate for each participant
    for (const participant of participants) {
      const certId = crypto.randomUUID();
      const verificationCode = generateVerificationCode();

      const certificate = {
        id: certId,
        eventId,
        participantName: participant.name,
        participantEmail: participant.email,
        verificationCode,
        status: 'delivered', // Simulating successful delivery
        createdAt: new Date().toISOString(),
        certificateUrl: generateCertificateUrl(certId, verificationCode),
      };

      await kv.set(`cert:${eventId}:${certId}`, certificate);
      
      // Store verification mapping
      await kv.set(`verify:${verificationCode}`, {
        certId,
        eventId,
        participantName: participant.name,
        eventName: event.name,
        eventDate: event.date,
        organizer: event.organizer,
      });

      generated++;

      // In a real implementation, you would send emails here
      // For now, we're simulating successful email delivery
      console.log(`Certificate generated for ${participant.name} (${participant.email})`);
    }

    return c.json({
      success: true,
      generated,
      message: `Successfully generated ${generated} certificates`,
    });
  } catch (error: any) {
    console.error('Error generating certificates:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Verify certificate with QR code
app.get('/make-server-81a513d4/verify/:verificationCode', async (c) => {
  try {
    const verificationCode = c.req.param('verificationCode');
    const certificateData = await kv.get(`verify:${verificationCode}`);

    if (!certificateData) {
      return c.json({ error: 'Certificate not found', valid: false }, 404);
    }

    return c.json({
      valid: true,
      certificate: certificateData,
    });
  } catch (error: any) {
    console.error('Error verifying certificate:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Helper functions
function generateVerificationCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 12; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function generateCertificateUrl(certId: string, verificationCode: string): string {
  // In a real implementation, this would return a Supabase Storage signed URL
  // For now, we return a verification URL
  return `https://eventeye.app/verify/${verificationCode}`;
}

Deno.serve(app.fetch);

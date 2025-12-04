import { useEffect, useRef } from 'react';
import { Award } from 'lucide-react';

interface CertificatePreviewProps {
  participantName: string;
  eventName: string;
  eventDate: string;
  organizer: string;
}

export function CertificatePreview({
  participantName,
  eventName,
  eventDate,
  organizer,
}: CertificatePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    drawCertificate();
  }, [participantName, eventName, eventDate, organizer]);

  const drawCertificate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;

    // Background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#f0f9ff');
    gradient.addColorStop(1, '#e0f2fe');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Border
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 8;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 2;
    ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

    // Title
    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Certificate of Participation', canvas.width / 2, 100);

    // Divider line
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(150, 130);
    ctx.lineTo(canvas.width - 150, 130);
    ctx.stroke();

    // This is to certify that
    ctx.fillStyle = '#475569';
    ctx.font = '20px Arial';
    ctx.fillText('This is to certify that', canvas.width / 2, 180);

    // Participant name
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 40px Arial';
    ctx.fillText(participantName, canvas.width / 2, 240);

    // Name underline
    const nameWidth = ctx.measureText(participantName).width;
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo((canvas.width - nameWidth) / 2, 250);
    ctx.lineTo((canvas.width + nameWidth) / 2, 250);
    ctx.stroke();

    // Has successfully participated in
    ctx.fillStyle = '#475569';
    ctx.font = '20px Arial';
    ctx.fillText('has successfully participated in', canvas.width / 2, 290);

    // Event name
    ctx.fillStyle = '#1e40af';
    ctx.font = 'bold 28px Arial';
    ctx.fillText(eventName, canvas.width / 2, 340);

    // Date
    ctx.fillStyle = '#64748b';
    ctx.font = '18px Arial';
    const formattedDate = new Date(eventDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    ctx.fillText(`Held on ${formattedDate}`, canvas.width / 2, 380);

    // Organizer signature section
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 22px Arial';
    ctx.fillText(organizer, canvas.width / 2, 480);

    ctx.fillStyle = '#64748b';
    ctx.font = '16px Arial';
    ctx.fillText('Event Organizer', canvas.width / 2, 505);

    // Signature line
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 100, 470);
    ctx.lineTo(canvas.width / 2 + 100, 470);
    ctx.stroke();

    // QR Code placeholder
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(canvas.width - 130, canvas.height - 130, 100, 100);
    ctx.fillStyle = '#64748b';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('QR Code', canvas.width - 80, canvas.height - 65);
    ctx.fillText('Verification', canvas.width - 80, canvas.height - 50);
  };

  return (
    <div className="glass-card rounded-xl shadow-xl p-6">
      <h2 className="text-gray-100 mb-4 drop-shadow-lg">Certificate Preview</h2>
      <div className="border-2 border-white/20 rounded-lg overflow-hidden backdrop-blur-sm">
        <canvas ref={canvasRef} className="w-full h-auto" />
      </div>
      <p className="text-gray-300 mt-4 drop-shadow">
        This is a preview of how the certificates will look. Each certificate will include a unique QR code for verification.
      </p>
    </div>
  );
}
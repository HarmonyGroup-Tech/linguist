import { auth } from '../config/firebase';

export const EmailService = {
    /**
     * Sends a professional branded verification email.
     * In a production environment with a backend, we would use a service like Resend or SendGrid.
     * For the Firebase-only mockup, we would typically use a Cloud Function.
     * Here we provide the professional template logic.
     */
    async sendProfessionalVerification(email: string, displayName?: string) {
        const name = displayName || email.split('@')[0];

        // Branded HTML Template
        const htmlTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Outfit', sans-serif; background-color: #F3F4F6; margin: 0; padding: 20px; }
                .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
                .header { background: #FFD23F; padding: 40px; text-align: center; }
                .content { padding: 40px; text-align: center; color: #1F2937; }
                .mascot { width: 100px; height: 100px; margin-bottom: 20px; }
                .button { 
                    display: inline-block; 
                    background: #1F2937; 
                    color: white; 
                    padding: 18px 36px; 
                    border-radius: 16px; 
                    text-decoration: none; 
                    font-weight: bold; 
                    margin-top: 30px;
                    transition: transform 0.2s ease;
                }
                .footer { padding: 30px; text-align: center; color: #9CA3AF; font-size: 12px; }
                h1 { margin: 0; font-size: 28px; font-weight: 900; }
                p { line-height: 1.6; font-size: 16px; margin: 10px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <img src="https://linguist-app.web.app/assets/branding/lingu.png" class="mascot" alt="Lingu" />
                    <h1>Willkommen bei Linguist!</h1>
                </div>
                <div class="content">
                    <p>Hallo <strong>${name}</strong>,</p>
                    <p>Ich bin Lingu! Ich freue mich riesig, dich auf deiner Reise zur deutschen Sprache zu begleiten.</p>
                    <p>Bevor wir anfangen zu zwitschern, musst du nur noch kurz deine E-Mail bestätigen:</p>
                    
                    <a href="{{VERIFICATION_LINK}}" class="button">E-Mail bestätigen</a>
                    
                    <p style="margin-top: 40px; font-size: 14px; opacity: 0.7;">
                        Falls du den Button nicht klicken kannst, kopiere diesen Link in deinen Browser:<br>
                        {{VERIFICATION_LINK}}
                    </p>
                </div>
                <div class="footer">
                    &copy; 2026 Linguist - Dein gefiederter Deutsch-Guide.<br>
                    Du erhältst diese E-Mail, weil du dich bei Linguist angemeldet hast.
                </div>
            </div>
        </body>
        </html>
        `;

        console.log(`[EmailService] Preparing professional email for ${email}`);
        // Note: Actual delivery would happen via a Backend / Cloud Function triggered here
        // or by using Firebase's custom action URL if we were using their SMTP service.

        return true;
    }
};

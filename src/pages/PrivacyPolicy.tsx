import { motion } from 'framer-motion';
import { Shield, ArrowLeft, Clock, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PrivacyPolicy() {
    const navigate = useNavigate();

    const sections = [
        {
            id: "information-we-collect",
            title: "1. Information We Collect",
            content: [
                {
                    subtitle: "1.1 Authentication & Account Information",
                    text: "To securely authenticate users and manage daily sessions, we collect and process:",
                    bullets: ["Email Address", "Unique User ID", "Last Login Timestamp", "Encrypted authentication credentials"],
                    footer: "These data are used strictly for account security, login functionality, and session management."
                },
                {
                    subtitle: "1.2 Learning Intelligence Data",
                    text: "Linguist uses artificial intelligence to personalize your learning experience. For this purpose, we collect and analyze:",
                    bullets: ["Skill Levels (e.g., grammar, vocabulary, comprehension)", "Mistake History", "Personalized AI-generated lesson data"],
                    footer: "This information allows our AI systems to adapt lesson difficulty, identify strengths and weaknesses, and recommend personalized learning paths."
                },
                {
                    subtitle: "1.3 Engagement & Energy Metrics",
                    text: "To support learning consistency and motivation, we store:",
                    bullets: ["Daily Streak Count", "Ling Energy Balance", "Energy Refill Timestamps"],
                    footer: "These metrics help maintain engagement and provide progress-based incentives."
                },
                {
                    subtitle: "1.4 Progression & Achievement Data",
                    text: "To track and display your progress, we record:",
                    bullets: ["Total XP Points", "Completed Lesson IDs", "Badge and Achievement Progress"],
                    footer: "This data is used to visualize growth and unlock in-app rewards."
                }
            ]
        },
        {
            id: "how-we-use",
            title: "2. How We Use Your Information",
            text: "We use collected information to:",
            bullets: [
                "Authenticate and secure user accounts",
                "Provide personalized AI-powered learning experiences",
                "Track progress and performance over time",
                "Improve app functionality and learning outcomes",
                "Maintain engagement features such as streaks and rewards",
                "Detect and prevent fraud or misuse"
            ]
        },
        {
            id: "storage-security",
            title: "3. Data Storage & Security",
            bullets: [
                "All sensitive data is encrypted in transit and at rest.",
                "We use industry-standard security measures to protect your information.",
                "Access to user data is restricted to authorized systems only.",
                "Despite our best efforts, no method of electronic storage is 100% secure, and we cannot guarantee absolute security."
            ]
        },
        {
            id: "sharing",
            title: "4. Data Sharing",
            text: "We do not sell or rent your personal data. Your information may only be shared:",
            bullets: [
                "With trusted service providers strictly necessary for app functionality (e.g., cloud hosting)",
                "When required by law, regulation, or legal process",
                "To protect the rights, safety, or property of Linguist and its users"
            ]
        },
        {
            id: "retention",
            title: "5. Data Retention",
            text: "We retain your data only for as long as necessary to:",
            bullets: [
                "Provide the App’s services",
                "Comply with legal obligations",
                "Resolve disputes",
                "Enforce our agreements"
            ],
            footer: "You may request deletion of your account and associated data at any time."
        },
        {
            id: "rights",
            title: "6. Your Rights",
            text: "Depending on your jurisdiction, you may have the right to:",
            bullets: [
                "Access your personal data",
                "Correct inaccurate information",
                "Request data deletion",
                "Object to or restrict data processing",
                "Withdraw consent where applicable"
            ],
            footer: "Requests can be made via the contact information below."
        },
        {
            id: "children",
            title: "7. Children’s Privacy",
            text: "Linguist is not intended for children under the age required by applicable law without parental consent. We do not knowingly collect personal data from children without proper authorization."
        },
        {
            id: "changes",
            title: "8. Changes to This Policy",
            text: "We may update this Privacy Policy from time to time. Changes will be effective upon posting within the App or on our website. Continued use of Linguist after updates constitutes acceptance of the revised policy."
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
            {/* Header */}
            <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
                <div className="max-w-4xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-gray-500 hover:text-brand-dark dark:hover:text-white flex items-center gap-2 group font-bold"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="hidden sm:inline">Back</span>
                    </button>

                    <h1 className="text-xl md:text-2xl font-bold text-brand-dark dark:text-white flex items-center gap-3">
                        <Shield className="w-6 h-6 text-brand-yellow" />
                        Privacy Policy
                    </h1>

                    <div className="w-10"></div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-12 md:py-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-12"
                >
                    {/* Intro */}
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-yellow/10 text-brand-yellow rounded-full text-sm font-bold border border-brand-yellow/20">
                            <Clock className="w-4 h-4" />
                            Last Updated: January 20, 2026
                        </div>
                        <div className="prose prose-lg dark:prose-invert max-w-none">
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                                Linguist (“we”, “our”, or “us”) values your privacy. This Privacy Policy explains how we collect, use, store, and protect your information when you use the Linguist mobile application and related services (collectively, the “App”).
                            </p>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                                By using Linguist, you agree to the collection and use of information in accordance with this Privacy Policy.
                            </p>
                        </div>
                    </div>

                    <hr className="border-gray-200 dark:border-gray-800" />

                    {/* Policy Content */}
                    <div className="space-y-16">
                        {sections.map((section, idx) => (
                            <motion.section
                                key={section.id}
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                className="space-y-6"
                            >
                                <h2 className="text-2xl md:text-3xl font-black text-brand-dark dark:text-white leading-tight">
                                    {section.title}
                                </h2>

                                {section.text && (
                                    <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                                        {section.text}
                                    </p>
                                )}

                                {section.bullets && (
                                    <ul className="space-y-3">
                                        {section.bullets.map((bullet, i) => (
                                            <li key={i} className="flex items-start gap-4 p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                                                <div className="w-1.5 h-1.5 rounded-full bg-brand-yellow mt-2 shrink-0" />
                                                <span className="text-gray-700 dark:text-gray-300 font-bold leading-relaxed">{bullet}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                {section.content && (
                                    <div className="space-y-10 pl-4 md:pl-6 border-l-2 border-brand-yellow/20">
                                        {section.content.map((sub, i) => (
                                            <div key={i} className="space-y-4">
                                                <h3 className="text-xl font-bold text-brand-dark dark:text-gray-200">
                                                    {sub.subtitle}
                                                </h3>
                                                <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed italic">
                                                    {sub.text}
                                                </p>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {sub.bullets.map((b, j) => (
                                                        <div key={j} className="p-3 bg-gray-100/50 dark:bg-gray-800/30 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-700/50">
                                                            {b}
                                                        </div>
                                                    ))}
                                                </div>
                                                {sub.footer && (
                                                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                                                        {sub.footer}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {section.footer && (
                                    <p className="text-gray-500 dark:text-gray-400 font-medium italic text-sm">
                                        {section.footer}
                                    </p>
                                )}
                            </motion.section>
                        ))}

                        {/* Contact Section */}
                        <motion.section
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="bg-brand-dark dark:bg-gray-900 rounded-[2.5rem] p-8 md:p-12 text-white space-y-8 relative overflow-hidden group shadow-2xl"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-yellow opacity-5 -translate-y-1/2 translate-x-1/2 rounded-full group-hover:scale-110 transition-transform duration-700" />

                            <div className="space-y-4 relative">
                                <h2 className="text-3xl font-black">9. Contact Us</h2>
                                <p className="text-gray-400 font-medium leading-relaxed max-w-lg">
                                    If you have questions or concerns about this Privacy Policy or your data, please reach out to our team.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
                                <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 hover:border-brand-yellow/50 transition-colors">
                                    <Mail className="w-8 h-8 text-brand-yellow mb-4" />
                                    <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mb-1">Email</p>
                                    <a href="mailto:ege.guler@harmonygroup.digital" className="text-lg font-bold hover:text-brand-yellow transition-colors">
                                        ege.guler@harmonygroup.digital
                                    </a>
                                </div>
                                <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10">
                                    <Shield className="w-8 h-8 text-brand-yellow mb-4" />
                                    <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mb-1">App Name</p>
                                    <p className="text-xl font-bold">Linguist</p>
                                </div>
                            </div>
                        </motion.section>
                    </div>
                </motion.div>
            </main>

            <footer className="max-w-3xl mx-auto px-4 py-12 text-center text-gray-400 dark:text-gray-600 text-sm font-bold border-t border-gray-100 dark:border-gray-900">
                &copy; {new Date().getFullYear()} Linguist by Harmony Group Digital
            </footer>
        </div>
    );
}

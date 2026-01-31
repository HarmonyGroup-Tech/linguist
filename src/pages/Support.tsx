import { motion } from 'framer-motion';
import { HelpCircle, Mail, MessageSquare, Shield, ArrowLeft, LifeBuoy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Support() {
    const navigate = useNavigate();

    const contactMethods = [
        {
            icon: <Mail className="w-6 h-6" />,
            title: "Email Support",
            description: "Direct assistance for all inquiries",
            value: "ege.guler@harmonygroup.digital",
            link: "mailto:ege.guler@harmonygroup.digital",
            color: "bg-blue-500"
        },
        {
            icon: <MessageSquare className="w-6 h-6" />,
            title: "General Inquiries",
            description: "For partnership and sales questions",
            value: "Contact Sales",
            link: "mailto:ege.guler@harmonygroup.digital",
            color: "bg-brand-yellow"
        },
        {
            icon: <LifeBuoy className="w-6 h-6" />,
            title: "Technical Support",
            description: "Reporting bugs or platform issues",
            value: "Get Tech Help",
            link: "mailto:ege.guler@harmonygroup.digital",
            color: "bg-green-500"
        }
    ];

    const faqs = [
        {
            q: "How do I top up my balance?",
            a: "Go to your Publisher Console (Client Dashboard) and click 'Add Funds' in the header. You can use Google Pay for instant deposits."
        },
        {
            q: "How does AI validation work?",
            a: "Our AI systems verify translations against the source text to ensure accuracy, grammar, and context before they are accepted."
        },
        {
            q: "Who can I contact for billing issues?",
            a: "Please email ege.guler@harmonygroup.digital with your Transaction ID for any billing or payment concerns."
        }
    ];

    return (
        <div className="min-h-screen bg-brand-gray dark:bg-gray-900 transition-colors duration-300">
            {/* Header */}
            <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors text-gray-400 hover:text-brand-dark dark:hover:text-white flex items-center gap-2 group font-bold"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span>Back</span>
                    </button>

                    <h1 className="text-xl md:text-2xl font-bold text-brand-dark dark:text-white flex items-center gap-3">
                        <HelpCircle className="w-6 h-6 text-brand-yellow" />
                        Support Center
                    </h1>

                    <div className="w-10"></div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-20"
                >
                    {/* Hero Section */}
                    <div className="text-center space-y-4">
                        <h2 className="text-4xl md:text-5xl font-black text-brand-dark dark:text-white">How can we help?</h2>
                        <p className="text-lg text-gray-500 dark:text-gray-400 font-medium max-w-2xl mx-auto">
                            Whether you're a learner or a publisher, we're here to ensure you have the best experience on Linguist.
                        </p>
                    </div>

                    {/* Contact Cards */}
                    <div className="grid md:grid-cols-3 gap-8">
                        {contactMethods.map((method, idx) => (
                            <motion.a
                                key={idx}
                                href={method.link}
                                whileHover={{ y: -5 }}
                                className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-xl shadow-gray-200/50 dark:shadow-black/20 group"
                            >
                                <div className={`w-14 h-14 ${method.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-${method.color.split('-')[1]}-500/20`}>
                                    {method.icon}
                                </div>
                                <h3 className="text-xl font-black text-brand-dark dark:text-white mb-2">{method.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-bold mb-4">{method.description}</p>
                                <div className="text-brand-dark dark:text-brand-yellow font-black underline decoration-2 underline-offset-4 group-hover:text-blue-600 transition-colors">
                                    {method.value}
                                </div>
                            </motion.a>
                        ))}
                    </div>

                    <div className="grid lg:grid-cols-2 gap-16 items-start">
                        {/* FAQ Section */}
                        <div className="space-y-8">
                            <h3 className="text-2xl font-black text-brand-dark dark:text-white flex items-center gap-3">
                                <Shield className="w-6 h-6 text-brand-yellow" />
                                Frequently Asked Questions
                            </h3>
                            <div className="space-y-6">
                                {faqs.map((faq, idx) => (
                                    <div key={idx} className="bg-white/50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
                                        <h4 className="font-black text-brand-dark dark:text-white mb-2">{faq.q}</h4>
                                        <p className="text-gray-500 dark:text-gray-400 font-medium text-sm leading-relaxed">{faq.a}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Legal Note */}
                        <div className="bg-brand-dark dark:bg-black rounded-[2.5rem] p-10 text-white space-y-6 relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-yellow opacity-5 -translate-y-1/2 translate-x-1/2 rounded-full" />
                            <h3 className="text-2xl font-bold relative z-10">Legal & Compliance</h3>
                            <p className="text-gray-400 font-medium leading-relaxed relative z-10">
                                Linguist is operated by Harmony Group Digital. We are committed to protecting your data and ensuring secure transactions.
                            </p>
                            <div className="space-y-4 relative z-10">
                                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                                    <Shield className="w-5 h-5 text-brand-yellow" />
                                    <span className="text-sm font-bold">Secure SSL Encryption</span>
                                </div>
                                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                                    <Shield className="w-5 h-5 text-brand-yellow" />
                                    <span className="text-sm font-bold">Certified Google Pay Merchant</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </main>

            <footer className="max-w-5xl mx-auto px-6 py-12 text-center text-gray-400 dark:text-gray-600 text-sm font-bold border-t border-gray-100 dark:border-gray-800">
                &copy; {new Date().getFullYear()} Linguist by Harmony Group Digital. All rights reserved.
            </footer>
        </div>
    );
}

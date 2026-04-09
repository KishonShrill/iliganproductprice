import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { BookOpen, Award, ShieldAlert, ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const guideSteps = [
    {
        id: 'intro',
        icon: BookOpen,
        title: "Welcome to Community Contributions",
        description: "Budget Buddy relies on smart shoppers like you! By contributing updated prices and new products, you help everyone in Iligan City shop smarter and save money.",
        color: "text-blue-500",
        bgColor: "bg-blue-100"
    },
    {
        id: 'ranks',
        icon: Award,
        title: "Points & Ranking System",
        description: "Every approved contribution earns you points! \n\n• +5 points for a new product\n• +2 points for a price update\n\nRank up from 'Smart Shopper' to 'Budget Master' as you help the community.",
        color: "text-orange-500",
        bgColor: "bg-orange-100"
    },
    {
        id: 'rules',
        icon: ShieldAlert,
        title: "Rules & Requirements",
        description: "To prevent spam, your account must be at least 1 week old to submit prices. All submissions go to the 'Pending Hub' where other users will verify them. If your submission gets too many downvotes, it will be rejected.",
        color: "text-red-500",
        bgColor: "bg-red-100"
    }
];

export default function ContributionGuide() {
    const [currentStep, setCurrentStep] = useState(0);
    const navigate = useNavigate();
    const { addToast } = useOutletContext();
    const hasSeen = localStorage.getItem("budgetbuddy_hasSeenGuide");

    useEffect(() => {
        if (hasSeen) return navigate('/contribution/hub');
    }, [hasSeen, navigate])
    if (hasSeen) return null;

    const nextStep = () => {
        if (currentStep < guideSteps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            // Once finished, set a cookie/localstorage so they don't see this every time
            localStorage.setItem('budgetbuddy_hasSeenGuide', 'true');
            navigate('/contribution/hub');
        }
    };

    const prevStep = () => {
        if (currentStep > 0) setCurrentStep(prev => prev - 1);
    };

    const stepData = guideSteps[currentStep];

    return (
        <div className="min-h-[calc(100vh-76px)] flex items-center justify-center p-4 bg-white relative">
            <div className='bg-orange-500 blur-xl w-full h-full absolute z-0'></div>
            <Card className="w-full max-w-lg shadow-lg border-gray-100 bg-white z-10">
                <CardContent className="p-8 max-md:p-6 flex flex-col items-center text-center">
                    {/* Step Indicator */}
                    <div className="flex gap-2 mb-8">
                        {guideSteps.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-2 w-12 rounded-full transition-colors duration-300 ${idx <= currentStep ? 'bg-orange-500' : 'bg-gray-200'}`}
                            />
                        ))}
                    </div>

                    {/* Content */}
                    <div className={`w-20 h-20 ${stepData.bgColor} rounded-full flex items-center justify-center mb-6`}>
                        <stepData.icon className={`w-10 h-10 ${stepData.color}`} />
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-4">{stepData.title}</h2>
                    <p className="text-gray-600 whitespace-pre-line leading-relaxed min-h-[100px]">
                        {stepData.description}
                    </p>

                    {/* Footer Controls */}
                    <div className="flex w-full justify-between mt-10 pt-6 border-t border-gray-100">
                        <Button
                            variant="ghost"
                            onClick={prevStep}
                            disabled={currentStep === 0}
                            className={currentStep === 0 ? 'opacity-0' : ''}
                        >
                            <ChevronLeft className="w-4 h-4 mr-2" /> Back
                        </Button>

                        <Button
                            onClick={nextStep}
                            className="bg-orange-500 hover:bg-orange-600 text-white"
                        >
                            {currentStep === guideSteps.length - 1 ? (
                                <span className="flex items-center">Start Contributing <CheckCircle className="w-4 h-4 ml-2" /></span>
                            ) : (
                                <span className="flex items-center">Next <ChevronRight className="w-4 h-4 ml-2" /></span>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

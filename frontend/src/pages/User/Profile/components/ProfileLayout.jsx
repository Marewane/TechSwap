import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
    Wallet, 
    Calendar, 
    Star, 
    Settings, 
    CreditCard,
    LogOut
} from "lucide-react";

const ProfileLayout = ({ children, activeTab, onTabChange, profile, isOwner }) => {
    const tabs = [
        { id: 'overview', label: 'Overview', icon: Wallet },
        { id: 'sessions', label: 'Sessions', icon: Calendar },
        { id: 'reviews', label: 'Reviews', icon: Star },
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    
                    {/* Sidebar Navigation */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-8">
                            <CardContent className="p-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile</h2>
                                
                                {/* Navigation Tabs */}
                                <nav className="space-y-2 mb-8">
                                    {tabs.map((tab) => {
                                        const Icon = tab.icon;
                                        return (
                                            <Button
                                                key={tab.id}
                                                variant={activeTab === tab.id ? "default" : "ghost"}
                                                className="w-full justify-start"
                                                onClick={() => onTabChange(tab.id)}
                                            >
                                                <Icon className="h-4 w-4 mr-3" />
                                                {tab.label}
                                            </Button>
                                        );
                                    })}
                                </nav>

                                {/* Wallet Balance Section */}
                                <div className="border-t pt-6">
                                    <h3 className="font-semibold text-gray-900 mb-3">Wallet Balance</h3>
                                    <div className="text-2xl font-bold text-green-600 mb-4">
                                        1,250.75 Coins
                                    </div>
                                    <div className="space-y-2">
                                        <Button variant="outline" className="w-full justify-start" size="sm">
                                            <CreditCard className="h-4 w-4 mr-2" />
                                            Add Funds (Stripe)
                                        </Button>
                                        <Button variant="outline" className="w-full justify-start" size="sm">
                                            <LogOut className="h-4 w-4 mr-2" />
                                            Withdraw
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-3">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileLayout;
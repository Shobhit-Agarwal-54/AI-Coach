import { getUserOnboardingStatus } from '@/actions/user'
import { redirect } from 'next/navigation';
import React from 'react'
import DashboardView from './_components/dashboard-view';
import { getIndustryInsights } from '@/actions/dashboard';

const IndustryInsightsPage = async() => {
    const {isOnboarded}=await getUserOnboardingStatus();
    const insights=await getIndustryInsights();
    
    if(!isOnboarded)
    {
        redirect("/onboarding");
    }
  return (
    <div>
      <DashboardView insights={insights}>
      </DashboardView>
    </div>
  )
}

export default IndustryInsightsPage
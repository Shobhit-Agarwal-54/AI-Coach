import { getUserOnboardingStatus } from '@/actions/user'
import { redirect } from 'next/navigation';
import React from 'react'
import DashboardView from './_components/dashboard-view';
import { getIndustryInsights } from '@/actions/dashboard';

const IndustryInsightsPage = async() => {
    const {isOnboarded}=await getUserOnboardingStatus();
    if(!isOnboarded)
    {
        redirect("/onboarding");
    }
    // Whenever we go to the dashboard page then 
    // if user has an industry with industryInsight we will fetch the insight.
    // else if there is no industry insight then we will create it (for initial update on the onboarding page)
    const insights=await getIndustryInsights();
    
  return (
    <div>
      <DashboardView insights={insights}>
      </DashboardView>
    </div>
  )
}

export default IndustryInsightsPage
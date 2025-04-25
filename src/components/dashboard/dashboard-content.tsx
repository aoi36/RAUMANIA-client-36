"use client"

import { StatCard } from "./stat-card"
import { StatusDistributionChart } from "./status-distribution-chart"
import { RecentOrdersTable } from "./recent-orders-table"
import { RecentReviews } from "./recent-reviews"
import { Package, ShoppingCart, Users } from 'lucide-react'
import { Skeleton } from "@/components/ui/skeleton"
import useDashboardStore from "@/stores/useDashboardStore"

export function DashboardContent() {
  const { 
    isLoading, 
    summary, 
    orderStatusDistribution, 
    recentOrders, 
    recentReviews
  } = useDashboardStore()

  return (
    <div className="flex flex-col gap-6 p-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading || !summary ? (
          <>
            <Skeleton className="h-[120px] w-full" />
            <Skeleton className="h-[120px] w-full" />
            <Skeleton className="h-[120px] w-full" />
          </>
        ) : (
          <>
            <StatCard 
              title="Total Orders" 
              value={summary.totalOrders} 
              icon={<ShoppingCart />} 
              description={`${summary.newOrders} new orders`}
              trend={summary.orderGrowth}
            />
            <StatCard 
              title="Total Products" 
              value={summary.totalProducts} 
              icon={<Package />} 
              description={`${summary.newProducts} new products`}
              trend={summary.productGrowth}
            />
            <StatCard 
              title="Total Users" 
              value={summary.totalUsers} 
              icon={<Users />} 
              description={`${summary.newUsers} new users`}
              trend={summary.userGrowth}
            />
          </>
        )}
      </div>
      
      {/* Charts and Tables */}
      <div className="grid gap-6 md:grid-cols-2">
        {isLoading || !orderStatusDistribution.length ? (
          <Skeleton className="h-[400px] w-full" />
        ) : (
          <StatusDistributionChart data={orderStatusDistribution} />
        )}
        
        <div className="flex flex-col gap-6">
          {isLoading || !recentReviews.length ? (
            <Skeleton className="h-[400px] w-full" />
          ) : (
            <RecentReviews reviews={recentReviews.slice(0, 3)} />
          )}
        </div>
      </div>
      
      {/* Recent Orders */}
      {isLoading || !recentOrders.length ? (
        <Skeleton className="h-[400px] w-full" />
      ) : (
        <RecentOrdersTable orders={recentOrders} />
      )}
    </div>
  )
}
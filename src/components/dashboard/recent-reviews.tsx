import { format } from "date-fns"
import { Star, StarHalf } from 'lucide-react'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface RecentReview {
  id: string
  productName: string
  customerName: string
  rating: number
  content: string
  date: string
}

interface RecentReviewsProps {
  reviews: RecentReview[]
}

export function RecentReviews({ reviews }: RecentReviewsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Reviews</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="flex items-start space-x-4 border-b pb-4 last:border-0">
            <Avatar>
              <AvatarFallback>
                {review.customerName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex items-center">
                <p className="font-medium">{review.customerName}</p>
                <span className="mx-2 text-muted-foreground">•</span>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(review.date), "MMM dd, yyyy")}
                </p>
              </div>
              <p className="text-sm font-medium">
                {review.productName}
              </p>
              <div className="flex">
                {[...Array(5)].map((_, i) => {
                  const ratingValue = i + 1;
                  return (
                    <span key={i} className="text-amber-400">
                      {ratingValue <= review.rating ? (
                        <Star className="h-4 w-4 fill-current" />
                      ) : ratingValue - 0.5 === review.rating ? (
                        <StarHalf className="h-4 w-4 fill-current" />
                      ) : (
                        <Star className="h-4 w-4" />
                      )}
                    </span>
                  );
                })}
              </div>
              <p className="text-sm">{review.content}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
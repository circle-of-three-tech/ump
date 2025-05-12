import Image from 'next/image';
import { Star, Users } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Link from 'next/link';

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      listings: {
        where: { status: 'ACTIVE' },
        include: {
          images: true,
          _count: {
            select: {
              likes: true,
              comments: true
            }
          }
        },
        orderBy: { created_at: 'desc' }
      },
      reviews_received: {
        include: {
          reviewer: {
            select: {
              full_name: true,
              profile_image: true
            }
          }
        },
        orderBy: { created_at: 'desc' }
      },
      _count: {
        select: {
          followers: true,
          following: true,
          listings: true,
          reviews_received: true
        }
      }
    }
  });

  if (!user) return notFound();

  const isOwnProfile = session?.user?.id === user.id;
  const averageRating = user.reviews_received.reduce((acc: number, review: any) => acc + review.rating, 0) / 
    (user.reviews_received.length || 1);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${process.env.NEXT_PUBLIC_BASE_URL}/profile/${user.id}`,
    name: user.full_name,
    description: user.bio,
    image: user.profile_image,
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/profile/${user.id}`,
    memberOf: {
      '@type': 'Organization',
      name: user.university
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: averageRating.toFixed(1),
      reviewCount: user._count.reviews_received,
      bestRating: '5',
      worstRating: '1'
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Profile Image */}
              <div className="avatar">
                <div className="w-32 md:w-48 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  <Image
                    src={user.profile_image || `https://ui-avatars.com/api/?name=${user.full_name}`}
                    alt={user.full_name}
                    width={192}
                    height={192}
                  />
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold">{user.full_name}</h1>
                  {user.is_verified && (
                    <div className="badge badge-primary">Verified Student</div>
                  )}
                </div>

                <div className="text-base-content/70 text-lg">
                  <p>{user.university}</p>
                </div>
                
                {user.bio && (
                  <p className="text-base-content/80 max-w-2xl">{user.bio}</p>
                )}

                <div className="stats stats-vertical lg:stats-horizontal shadow">
                  <div className="stat">
                    <div className="stat-title">Followers</div>
                    <div className="stat-value text-2xl">{user._count.followers}</div>
                  </div>
                  
                  <div className="stat">
                    <div className="stat-title">Following</div>
                    <div className="stat-value text-2xl">{user._count.following}</div>
                  </div>

                  <div className="stat">
                    <div className="stat-title">Rating</div>
                    <div className="stat-value text-2xl flex items-center gap-2">
                      {averageRating.toFixed(1)}
                      <Star className="w-5 h-5 text-warning" />
                    </div>
                    <div className="stat-desc">
                      {user._count.reviews_received} reviews
                    </div>
                  </div>
                </div>

                {!isOwnProfile && (
                  <button className="btn btn-primary">
                    Follow
                  </button>
                )}

                {isOwnProfile && (
                  <Link href="/settings" className="btn btn-outline">
                    Edit Profile
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Tabs defaultValue="listings" className="w-full">
            <TabsList className="tabs tabs-boxed justify-center">
              <TabsTrigger value="listings" className="tab tab-lg">
                Listings ({user._count.listings})
              </TabsTrigger>
              <TabsTrigger value="reviews" className="tab tab-lg">
                Reviews ({user._count.reviews_received})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="listings" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {user.listings.map((listing: any) => (
                  <Link 
                    href={`/listings/${listing.id}`} 
                    key={listing.id} 
                    className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow"
                  >
                    {listing.images[0] && (
                      <figure className="relative h-48">
                        <Image
                          src={listing.images[0].url}
                          alt={listing.title}
                          fill
                          className="object-cover"
                        />
                      </figure>
                    )}
                    <div className="card-body">
                      <h2 className="card-title text-lg">{listing.title}</h2>
                      <p className="text-2xl font-bold text-primary">${listing.price}</p>
                      <div className="card-actions justify-between items-center">
                        <div className="badge badge-outline">{listing.category}</div>
                        <div className="flex gap-3 text-base-content/70">
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4" />
                            {listing._count.likes}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <div className="space-y-6">
                {user.reviews_received.map((review: any) => (
                  <div key={review.id} className="card bg-base-100 shadow-lg">
                    <div className="card-body">
                      <div className="flex items-center gap-4">
                        <div className="avatar">
                          <div className="w-12 rounded-full">
                            <Image
                              src={review.reviewer.profile_image || `https://ui-avatars.com/api/?name=${review.reviewer.full_name}`}
                              alt={review.reviewer.full_name}
                              width={48}
                              height={48}
                            />
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold">{review.reviewer.full_name}</h3>
                          <div className="flex items-center gap-1 mt-1">
                            {Array.from({ length: review.rating }).map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-current text-warning" />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-base-content/60 ml-auto">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="mt-4 text-base-content/80">{review.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}

export async function runCleanupJobs() {
  const CRON_SECRET_KEY = process.env.CRON_SECRET_KEY;
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

  if (!CRON_SECRET_KEY || !APP_URL) {
    throw new Error('Missing required environment variables');
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${CRON_SECRET_KEY}`
  };

  // Run cleanup jobs in parallel
  const results = await Promise.all([
    // Cleanup expired sponsorships
    fetch(`${APP_URL}/api/jobs/cleanup-sponsorships`, {
      method: 'POST',
      headers
    }).then(res => res.json()),

    // Cleanup expired escrow transactions
    fetch(`${APP_URL}/api/jobs/cleanup-escrow`, {
      method: 'POST',
      headers
    }).then(res => res.json())
  ]);

  return {
    sponsorshipsProcessed: results[0].processedCount,
    escrowsProcessed: results[1].processedCount
  };
}

// This function can be called by a CRON service (e.g., Vercel Cron Jobs)
export async function handleScheduledJobs() {
  try {
    const results = await runCleanupJobs();
    console.log('Cleanup jobs completed:', results);
    return { success: true, ...results };
  } catch (error) {
    console.error('Scheduled jobs error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
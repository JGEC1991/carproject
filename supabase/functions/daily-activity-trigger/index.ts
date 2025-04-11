import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      }
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseService = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const today = new Date();
    const todayDayOfWeek = today.toLocaleDateString('en-US', {
      weekday: 'long'
    });
    const todayDateString = today.toISOString().slice(0, 10);

    // Fetch all automatic activities that apply today
    const { data: automaticActivities, error: automaticActivitiesError } = await supabaseService.from('automatic_activities').select('*');

    if (automaticActivitiesError) {
      console.error('Error fetching automatic activities:', automaticActivitiesError);
      return new Response(JSON.stringify({
        error: 'Failed to fetch automatic activities'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Iterate through each automatic activity and create activities if needed
    for (const activityDefinition of automaticActivities){
      const { driver_id, vehicle_id, activity_type, cadence, day_of_week, start_date, description, status, amount, organization_id } = activityDefinition;
      let shouldCreateActivity = false;

      if (cadence === 'daily') {
        shouldCreateActivity = true;
      } else if (cadence === 'weekly') {
        if (day_of_week && day_of_week.includes(todayDayOfWeek)) {
          shouldCreateActivity = true;
        }
      }

      if (shouldCreateActivity) {
        // Create the activity
        const { error: activityError } = await supabaseService.from('activities').insert([
          {
            date: todayDateString,
            vehicle_id,
            driver_id,
            activity_type,
            description,
            status,
            amount,
            organization_id
          }
        ]);

        if (activityError) {
          console.error('Error creating activity from automatic activity', activityDefinition.id, ':', activityError);
        } else {
          console.log('Activity created from automatic activity', activityDefinition.id);
        }
      }
    }

    return new Response(JSON.stringify({
      message: 'Daily activity trigger executed successfully'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Unhandled error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
});

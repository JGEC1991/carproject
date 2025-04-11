import { createClient } from 'jsr:@supabase/supabase-js@2';

Deno.serve(async (req) => {
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
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

    const supabaseService = createClient(supabaseUrl, supabaseAnonKey);

    // Define the ID of the row you want to update
    const rowIdToUpdate = 'your-row-id'; // Replace with the actual row ID

    // Fetch the current data of the row
    const { data: currentData, error: fetchError } = await supabaseService
      .from('automatic_activities')
      .select('*')
      .eq('id', rowIdToUpdate)
      .single();

    if (fetchError) {
      console.error('Error fetching automatic activity:', fetchError);
      return new Response(
        JSON.stringify({
          error: 'Failed to fetch automatic activity'
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    if (!currentData) {
      return new Response(
        JSON.stringify({
          error: 'Automatic activity not found'
        }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // Define the update you want to make
    const updateData = {
      // Example: Increment a symbolic counter or update a timestamp
      symbolic_counter: (currentData.symbolic_counter || 0) + 1,
      last_updated: new Date().toISOString()
    };

    // Update the row
    const { error: updateError } = await supabaseService
      .from('automatic_activities')
      .update(updateData)
      .eq('id', rowIdToUpdate);

    if (updateError) {
      console.error('Error updating automatic activity:', updateError);
      return new Response(
        JSON.stringify({
          error: 'Failed to update automatic activity'
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    return new Response(
      JSON.stringify({
        message: 'Automatic activity updated successfully'
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Unhandled error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
});

import { supabase } from './supabaseClient';

/**
 * Check if a user has access to a specific course
 */
export const checkCourseAccess = async (userId, courseId) => {
  try {
    const { data, error } = await supabase
      .from('course_access_requests')
      .select('status')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned (user hasn't requested access yet)
      throw error;
    }

    return {
      hasAccess: data?.status === 'approved',
      status: data?.status || null,
      hasRequested: !!data
    };
  } catch (err) {
    console.error('Error checking course access:', err);
    return { hasAccess: false, status: null, hasRequested: false };
  }
};

/**
 * Request access to a course
 */
export const requestCourseAccess = async (userId, courseId) => {
  try {
    const { data, error } = await supabase
      .from('course_access_requests')
      .insert([
        {
          user_id: userId,
          course_id: courseId,
          status: 'pending'
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('Error requesting course access:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Approve a course access request
 */
export const approveCourseAccess = async (requestId) => {
  try {
    const { data, error } = await supabase
      .from('course_access_requests')
      .update({ status: 'approved' })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('Error approving course access:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Reject a course access request
 */
export const rejectCourseAccess = async (requestId) => {
  try {
    const { data, error } = await supabase
      .from('course_access_requests')
      .update({ status: 'rejected' })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('Error rejecting course access:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Get all pending course access requests (admin only)
 */
export const getPendingRequests = async () => {
  try {
    const { data, error } = await supabase
      .from('course_access_requests')
      .select(`
        id,
        status,
        created_at,
        updated_at,
        user_id,
        course_id,
        courses (
          id,
          title,
          description,
          image_url
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) {
      return { success: true, data: [] };
    }

    // Fetch user emails from public.users
    const userIds = [...new Set(data.map(req => req.user_id))];
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id, email')
      .in('id', userIds);

    if (usersError) {
      console.warn('Error fetching from users table:', usersError);
    }

    // Fetch user data from auth.users using RPC as fallback
    // Create a map of emails
    const emailMap = new Map();
    if (usersData) {
      usersData.forEach(u => {
        if (u.email) emailMap.set(u.id, u.email);
      });
    }

    // For any missing emails, try to get from auth metadata
    const requestsWithUsers = await Promise.all(
      data.map(async (req) => {
        let email = emailMap.get(req.user_id);
        
        // If email not found in public.users, try to get it from auth.users via supabase auth admin
        if (!email) {
          try {
            // Try to fetch the user's session to get email
            const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(req.user_id);
            if (!userError && user?.email) {
              email = user.email;
            }
          } catch (e) {
            console.warn('Could not fetch user email for:', req.user_id);
          }
        }

        return {
          ...req,
          user_email: email || 'Unknown User'
        };
      })
    );

    return { success: true, data: requestsWithUsers };
  } catch (err) {
    console.error('Error fetching pending requests:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Check if the current user is an admin
 */
export const checkIsAdmin = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
    
    return data?.is_admin === true;
  } catch (err) {
    console.error('Error checking admin status:', err);
    return false;
  }
};

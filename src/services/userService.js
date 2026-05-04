import { supabase } from '../db/supabase';
import { makeStamp } from '../utils/stampHelper';

export async function setUserStatus(targetUserId, newStatus, actorUserId) {
  const { error } = await supabase
    .from('user')
    .update({
      record_status: newStatus,
      stamp: makeStamp(newStatus === 'ACTIVE' ? 'REACTIVATED' : 'DEACTIVATED', actorUserId),
    })
    .eq('userid', targetUserId)
    .neq('user_type', 'SUPERADMIN'); // extra DB-level guard

  if (error) throw error;
}
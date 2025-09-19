import sql from "@/app/api/utils/sql";

// Get single maintenance intervention
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const result = await sql`
      SELECT 
        mi.id, mi.equipment_id, mi.intervention_type, mi.title, mi.description,
        mi.priority, mi.status, mi.assigned_technician, mi.planned_date,
        mi.started_at, mi.completed_at, mi.estimated_duration, mi.actual_duration,
        mi.cost, mi.notes, mi.created_at, mi.updated_at,
        e.name as equipment_name, e.code as equipment_code,
        e.location as equipment_location, e.criticality as equipment_criticality
      FROM maintenance_interventions mi
      LEFT JOIN equipment e ON mi.equipment_id = e.id
      WHERE mi.id = ${id}
    `;

    if (result.length === 0) {
      return Response.json({ error: 'Maintenance intervention not found' }, { status: 404 });
    }

    return Response.json({ intervention: result[0] });
  } catch (error) {
    console.error('Error fetching maintenance intervention:', error);
    return Response.json({ error: 'Failed to fetch maintenance intervention' }, { status: 500 });
  }
}

// Update maintenance intervention
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    
    const {
      equipment_id, intervention_type, title, description, priority, status, assigned_technician,
      planned_date, started_at, completed_at, estimated_duration, actual_duration,
      cost, notes
    } = body;

    // Auto-set timestamps based on status changes
    let updateFields = {
      equipment_id,
      intervention_type,
      title,
      description,
      priority,
      status,
      assigned_technician,
      planned_date,
      estimated_duration,
      actual_duration,
      cost,
      notes,
      updated_at: sql`CURRENT_TIMESTAMP`
    };

    // Handle status-based timestamp updates
    if (status === 'in_progress' && !started_at) {
      updateFields.started_at = sql`CURRENT_TIMESTAMP`;
    } else if (started_at) {
      updateFields.started_at = started_at;
    }

    if (status === 'completed' && !completed_at) {
      updateFields.completed_at = sql`CURRENT_TIMESTAMP`;
    } else if (completed_at) {
      updateFields.completed_at = completed_at;
    }

    const result = await sql`
      UPDATE maintenance_interventions 
      SET 
        equipment_id = ${updateFields.equipment_id},
        intervention_type = ${updateFields.intervention_type},
        title = ${updateFields.title},
        description = ${updateFields.description},
        priority = ${updateFields.priority},
        status = ${updateFields.status},
        assigned_technician = ${updateFields.assigned_technician},
        planned_date = ${updateFields.planned_date},
        started_at = ${updateFields.started_at || sql`started_at`},
        completed_at = ${updateFields.completed_at || sql`completed_at`},
        estimated_duration = ${updateFields.estimated_duration},
        actual_duration = ${updateFields.actual_duration},
        cost = ${updateFields.cost},
        notes = ${updateFields.notes},
        updated_at = ${updateFields.updated_at}
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return Response.json({ error: 'Maintenance intervention not found' }, { status: 404 });
    }

    return Response.json({ intervention: result[0] });
  } catch (error) {
    console.error('Error updating maintenance intervention:', error);
    return Response.json({ error: 'Failed to update maintenance intervention' }, { status: 500 });
  }
}

// Delete maintenance intervention
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    const result = await sql`
      DELETE FROM maintenance_interventions 
      WHERE id = ${id}
      RETURNING id
    `;

    if (result.length === 0) {
      return Response.json({ error: 'Maintenance intervention not found' }, { status: 404 });
    }

    return Response.json({ message: 'Maintenance intervention deleted successfully' });
  } catch (error) {
    console.error('Error deleting maintenance intervention:', error);
    return Response.json({ error: 'Failed to delete maintenance intervention' }, { status: 500 });
  }
}
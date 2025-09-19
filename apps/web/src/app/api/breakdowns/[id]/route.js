import sql from "@/app/api/utils/sql";

// Get single breakdown
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const result = await sql`
      SELECT 
        b.id, b.equipment_id, b.title, b.description, b.severity,
        b.reported_by, b.reported_at, b.symptoms, b.cause_analysis,
        b.resolution, b.status, b.resolved_at, b.downtime_minutes,
        b.cost, b.created_at, b.updated_at,
        e.name as equipment_name, e.code as equipment_code,
        e.location as equipment_location
      FROM breakdowns b
      LEFT JOIN equipment e ON b.equipment_id = e.id
      WHERE b.id = ${id}
    `;

    if (result.length === 0) {
      return Response.json({ error: 'Breakdown not found' }, { status: 404 });
    }

    return Response.json({ breakdown: result[0] });
  } catch (error) {
    console.error('Error fetching breakdown:', error);
    return Response.json({ error: 'Failed to fetch breakdown' }, { status: 500 });
  }
}

// Update breakdown
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    
    const {
      equipment_id, title, description, severity, reported_by,
      symptoms, cause_analysis, resolution, status, downtime_minutes, cost
    } = body;

    // If status is being changed to resolved, set resolved_at timestamp
    const resolvedAt = status === 'resolved' ? 'CURRENT_TIMESTAMP' : null;

    const result = await sql`
      UPDATE breakdowns 
      SET 
        equipment_id = ${equipment_id},
        title = ${title},
        description = ${description},
        severity = ${severity},
        reported_by = ${reported_by},
        symptoms = ${symptoms},
        cause_analysis = ${cause_analysis},
        resolution = ${resolution},
        status = ${status},
        resolved_at = ${status === 'resolved' ? sql`CURRENT_TIMESTAMP` : sql`NULL`},
        downtime_minutes = ${downtime_minutes},
        cost = ${cost},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return Response.json({ error: 'Breakdown not found' }, { status: 404 });
    }

    return Response.json({ breakdown: result[0] });
  } catch (error) {
    console.error('Error updating breakdown:', error);
    return Response.json({ error: 'Failed to update breakdown' }, { status: 500 });
  }
}

// Delete breakdown
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    const result = await sql`
      DELETE FROM breakdowns 
      WHERE id = ${id}
      RETURNING id
    `;

    if (result.length === 0) {
      return Response.json({ error: 'Breakdown not found' }, { status: 404 });
    }

    return Response.json({ message: 'Breakdown deleted successfully' });
  } catch (error) {
    console.error('Error deleting breakdown:', error);
    return Response.json({ error: 'Failed to delete breakdown' }, { status: 500 });
  }
}
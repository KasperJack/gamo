import sql from "@/app/api/utils/sql";

// Get all curative maintenance interventions with optional filtering
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const priority = searchParams.get('priority');
    const status = searchParams.get('status');
    const equipmentId = searchParams.get('equipmentId');

    let query = `
      SELECT 
        mi.id, mi.equipment_id, mi.intervention_type, mi.title, mi.description,
        mi.priority, mi.status, mi.assigned_technician, mi.planned_date,
        mi.started_at, mi.completed_at, mi.estimated_duration, mi.actual_duration,
        mi.cost, mi.notes, mi.created_at, mi.updated_at,
        e.name as equipment_name, e.code as equipment_code,
        e.location as equipment_location, e.criticality as equipment_criticality,
        b.id as breakdown_id, b.title as breakdown_title, b.severity as breakdown_severity
      FROM maintenance_interventions mi
      LEFT JOIN equipment e ON mi.equipment_id = e.id
      LEFT JOIN breakdowns b ON b.equipment_id = mi.equipment_id AND b.status IN ('reported', 'investigating', 'in_progress')
      WHERE mi.intervention_type = 'curative'
    `;
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (LOWER(mi.title) LIKE LOWER($${paramCount}) OR LOWER(mi.description) LIKE LOWER($${paramCount}) OR LOWER(e.name) LIKE LOWER($${paramCount}))`;
      params.push(`%${search}%`);
    }

    if (priority) {
      paramCount++;
      query += ` AND mi.priority = $${paramCount}`;
      params.push(priority);
    }

    if (status) {
      paramCount++;
      query += ` AND mi.status = $${paramCount}`;
      params.push(status);
    }

    if (equipmentId) {
      paramCount++;
      query += ` AND mi.equipment_id = $${paramCount}`;
      params.push(equipmentId);
    }

    query += ` ORDER BY 
      CASE mi.priority 
        WHEN 'urgent' THEN 1 
        WHEN 'high' THEN 2 
        WHEN 'medium' THEN 3 
        WHEN 'low' THEN 4 
      END,
      mi.planned_date ASC NULLS LAST,
      mi.created_at DESC`;

    const interventions = await sql(query, params);
    return Response.json({ interventions });
  } catch (error) {
    console.error('Error fetching curative interventions:', error);
    return Response.json({ error: 'Failed to fetch curative interventions' }, { status: 500 });
  }
}

// Create new curative maintenance intervention
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      equipment_id, title, description, priority, assigned_technician,
      planned_date, estimated_duration, cost, notes
    } = body;

    if (!title) {
      return Response.json({ error: 'Title is required' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO maintenance_interventions (
        equipment_id, intervention_type, title, description, priority,
        assigned_technician, planned_date, estimated_duration, cost, notes, status
      ) VALUES (
        ${equipment_id}, 'curative', ${title}, ${description}, ${priority || 'medium'},
        ${assigned_technician}, ${planned_date}, ${estimated_duration}, ${cost}, ${notes}, 'planned'
      ) RETURNING *
    `;

    return Response.json({ intervention: result[0] });
  } catch (error) {
    console.error('Error creating curative intervention:', error);
    return Response.json({ error: 'Failed to create curative intervention' }, { status: 500 });
  }
}
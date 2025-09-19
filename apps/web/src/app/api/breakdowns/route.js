import sql from "@/app/api/utils/sql";

// Get all breakdowns with optional filtering
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const severity = searchParams.get('severity');
    const status = searchParams.get('status');
    const equipmentId = searchParams.get('equipmentId');

    let query = `
      SELECT 
        b.id, b.equipment_id, b.title, b.description, b.severity,
        b.reported_by, b.reported_at, b.symptoms, b.cause_analysis,
        b.resolution, b.status, b.resolved_at, b.downtime_minutes,
        b.cost, b.created_at, b.updated_at,
        e.name as equipment_name, e.code as equipment_code,
        e.location as equipment_location
      FROM breakdowns b
      LEFT JOIN equipment e ON b.equipment_id = e.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (LOWER(b.title) LIKE LOWER($${paramCount}) OR LOWER(b.description) LIKE LOWER($${paramCount}) OR LOWER(e.name) LIKE LOWER($${paramCount}))`;
      params.push(`%${search}%`);
    }

    if (severity) {
      paramCount++;
      query += ` AND b.severity = $${paramCount}`;
      params.push(severity);
    }

    if (status) {
      paramCount++;
      query += ` AND b.status = $${paramCount}`;
      params.push(status);
    }

    if (equipmentId) {
      paramCount++;
      query += ` AND b.equipment_id = $${paramCount}`;
      params.push(equipmentId);
    }

    query += ` ORDER BY b.reported_at DESC`;

    const breakdowns = await sql(query, params);
    return Response.json({ breakdowns });
  } catch (error) {
    console.error('Error fetching breakdowns:', error);
    return Response.json({ error: 'Failed to fetch breakdowns' }, { status: 500 });
  }
}

// Create new breakdown
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      equipment_id, title, description, severity, reported_by,
      symptoms, cause_analysis, resolution, status, downtime_minutes, cost
    } = body;

    if (!title) {
      return Response.json({ error: 'Title is required' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO breakdowns (
        equipment_id, title, description, severity, reported_by,
        symptoms, cause_analysis, resolution, status, downtime_minutes, cost
      ) VALUES (
        ${equipment_id}, ${title}, ${description}, ${severity || 'medium'}, ${reported_by},
        ${symptoms}, ${cause_analysis}, ${resolution}, ${status || 'reported'}, 
        ${downtime_minutes}, ${cost}
      ) RETURNING *
    `;

    return Response.json({ breakdown: result[0] });
  } catch (error) {
    console.error('Error creating breakdown:', error);
    return Response.json({ error: 'Failed to create breakdown' }, { status: 500 });
  }
}
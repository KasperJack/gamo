import sql from "@/app/api/utils/sql";

// Get all equipment with optional filtering
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const location = searchParams.get('location');

    let query = `
      SELECT 
        id, code, name, description, category, location, 
        manufacturer, model, serial_number, purchase_date, 
        warranty_end_date, status, criticality, 
        created_at, updated_at
      FROM equipment 
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (LOWER(name) LIKE LOWER($${paramCount}) OR LOWER(code) LIKE LOWER($${paramCount}) OR LOWER(description) LIKE LOWER($${paramCount}))`;
      params.push(`%${search}%`);
    }

    if (category) {
      paramCount++;
      query += ` AND category = $${paramCount}`;
      params.push(category);
    }

    if (status) {
      paramCount++;
      query += ` AND status = $${paramCount}`;
      params.push(status);
    }

    if (location) {
      paramCount++;
      query += ` AND location = $${paramCount}`;
      params.push(location);
    }

    query += ` ORDER BY name ASC`;

    const equipment = await sql(query, params);
    return Response.json({ equipment });
  } catch (error) {
    console.error('Error fetching equipment:', error);
    return Response.json({ error: 'Failed to fetch equipment' }, { status: 500 });
  }
}

// Create new equipment
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      code, name, description, category, location,
      manufacturer, model, serial_number, purchase_date,
      warranty_end_date, status, criticality
    } = body;

    if (!code || !name) {
      return Response.json({ error: 'Code and name are required' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO equipment (
        code, name, description, category, location,
        manufacturer, model, serial_number, purchase_date,
        warranty_end_date, status, criticality
      ) VALUES (
        ${code}, ${name}, ${description}, ${category}, ${location},
        ${manufacturer}, ${model}, ${serial_number}, ${purchase_date},
        ${warranty_end_date}, ${status || 'active'}, ${criticality || 'medium'}
      ) RETURNING *
    `;

    return Response.json({ equipment: result[0] });
  } catch (error) {
    console.error('Error creating equipment:', error);
    if (error.code === '23505') {
      return Response.json({ error: 'Equipment code already exists' }, { status: 400 });
    }
    return Response.json({ error: 'Failed to create equipment' }, { status: 500 });
  }
}
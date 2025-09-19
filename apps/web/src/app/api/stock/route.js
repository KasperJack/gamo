import sql from "@/app/api/utils/sql";

// Get all spare parts with optional filtering
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const stockStatus = searchParams.get('stockStatus');
    const supplier = searchParams.get('supplier');

    let query = `
      SELECT 
        id, part_number, name, description, category, manufacturer,
        supplier, unit_price, currency, current_stock, minimum_stock,
        maximum_stock, location, unit_of_measure, created_at, updated_at,
        CASE 
          WHEN current_stock <= 0 THEN 'out_of_stock'
          WHEN current_stock <= minimum_stock THEN 'low_stock'
          WHEN current_stock >= maximum_stock THEN 'overstock'
          ELSE 'normal'
        END as stock_status
      FROM spare_parts 
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (LOWER(name) LIKE LOWER($${paramCount}) OR LOWER(part_number) LIKE LOWER($${paramCount}) OR LOWER(description) LIKE LOWER($${paramCount}))`;
      params.push(`%${search}%`);
    }

    if (category) {
      paramCount++;
      query += ` AND category = $${paramCount}`;
      params.push(category);
    }

    if (supplier) {
      paramCount++;
      query += ` AND supplier = $${paramCount}`;
      params.push(supplier);
    }

    if (stockStatus) {
      if (stockStatus === 'out_of_stock') {
        query += ` AND current_stock <= 0`;
      } else if (stockStatus === 'low_stock') {
        query += ` AND current_stock > 0 AND current_stock <= minimum_stock`;
      } else if (stockStatus === 'overstock') {
        query += ` AND current_stock >= maximum_stock`;
      } else if (stockStatus === 'normal') {
        query += ` AND current_stock > minimum_stock AND current_stock < maximum_stock`;
      }
    }

    query += ` ORDER BY name ASC`;

    const spareParts = await sql(query, params);
    return Response.json({ spareParts });
  } catch (error) {
    console.error('Error fetching spare parts:', error);
    return Response.json({ error: 'Failed to fetch spare parts' }, { status: 500 });
  }
}

// Create new spare part
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      part_number, name, description, category, manufacturer,
      supplier, unit_price, currency, current_stock, minimum_stock,
      maximum_stock, location, unit_of_measure
    } = body;

    if (!part_number || !name) {
      return Response.json({ error: 'Part number and name are required' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO spare_parts (
        part_number, name, description, category, manufacturer,
        supplier, unit_price, currency, current_stock, minimum_stock,
        maximum_stock, location, unit_of_measure
      ) VALUES (
        ${part_number}, ${name}, ${description}, ${category}, ${manufacturer},
        ${supplier}, ${unit_price}, ${currency || 'EUR'}, ${current_stock || 0}, 
        ${minimum_stock || 0}, ${maximum_stock || 0}, ${location}, ${unit_of_measure}
      ) RETURNING *
    `;

    return Response.json({ sparePart: result[0] });
  } catch (error) {
    console.error('Error creating spare part:', error);
    if (error.code === '23505') {
      return Response.json({ error: 'Part number already exists' }, { status: 400 });
    }
    return Response.json({ error: 'Failed to create spare part' }, { status: 500 });
  }
}
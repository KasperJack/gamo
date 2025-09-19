import sql from "@/app/api/utils/sql";

// Get single spare part
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const result = await sql`
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
      WHERE id = ${id}
    `;

    if (result.length === 0) {
      return Response.json({ error: 'Spare part not found' }, { status: 404 });
    }

    return Response.json({ sparePart: result[0] });
  } catch (error) {
    console.error('Error fetching spare part:', error);
    return Response.json({ error: 'Failed to fetch spare part' }, { status: 500 });
  }
}

// Update spare part
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    
    const {
      part_number, name, description, category, manufacturer,
      supplier, unit_price, currency, current_stock, minimum_stock,
      maximum_stock, location, unit_of_measure
    } = body;

    const result = await sql`
      UPDATE spare_parts 
      SET 
        part_number = ${part_number},
        name = ${name},
        description = ${description},
        category = ${category},
        manufacturer = ${manufacturer},
        supplier = ${supplier},
        unit_price = ${unit_price},
        currency = ${currency},
        current_stock = ${current_stock},
        minimum_stock = ${minimum_stock},
        maximum_stock = ${maximum_stock},
        location = ${location},
        unit_of_measure = ${unit_of_measure},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return Response.json({ error: 'Spare part not found' }, { status: 404 });
    }

    return Response.json({ sparePart: result[0] });
  } catch (error) {
    console.error('Error updating spare part:', error);
    if (error.code === '23505') {
      return Response.json({ error: 'Part number already exists' }, { status: 400 });
    }
    return Response.json({ error: 'Failed to update spare part' }, { status: 500 });
  }
}

// Delete spare part
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    const result = await sql`
      DELETE FROM spare_parts 
      WHERE id = ${id}
      RETURNING id
    `;

    if (result.length === 0) {
      return Response.json({ error: 'Spare part not found' }, { status: 404 });
    }

    return Response.json({ message: 'Spare part deleted successfully' });
  } catch (error) {
    console.error('Error deleting spare part:', error);
    return Response.json({ error: 'Failed to delete spare part' }, { status: 500 });
  }
}
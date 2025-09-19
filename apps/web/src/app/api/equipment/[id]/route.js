import sql from "@/app/api/utils/sql";

// Get single equipment by ID
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const equipment = await sql`
      SELECT 
        id, code, name, description, category, location, 
        manufacturer, model, serial_number, purchase_date, 
        warranty_end_date, status, criticality, 
        created_at, updated_at
      FROM equipment 
      WHERE id = ${id}
    `;

    if (equipment.length === 0) {
      return Response.json({ error: 'Equipment not found' }, { status: 404 });
    }

    return Response.json({ equipment: equipment[0] });
  } catch (error) {
    console.error('Error fetching equipment:', error);
    return Response.json({ error: 'Failed to fetch equipment' }, { status: 500 });
  }
}

// Update equipment
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    
    const {
      code, name, description, category, location,
      manufacturer, model, serial_number, purchase_date,
      warranty_end_date, status, criticality
    } = body;

    // Build dynamic update query
    const setClauses = [];
    const values = [];
    let paramCount = 0;

    if (code !== undefined) {
      paramCount++;
      setClauses.push(`code = $${paramCount}`);
      values.push(code);
    }
    if (name !== undefined) {
      paramCount++;
      setClauses.push(`name = $${paramCount}`);
      values.push(name);
    }
    if (description !== undefined) {
      paramCount++;
      setClauses.push(`description = $${paramCount}`);
      values.push(description);
    }
    if (category !== undefined) {
      paramCount++;
      setClauses.push(`category = $${paramCount}`);
      values.push(category);
    }
    if (location !== undefined) {
      paramCount++;
      setClauses.push(`location = $${paramCount}`);
      values.push(location);
    }
    if (manufacturer !== undefined) {
      paramCount++;
      setClauses.push(`manufacturer = $${paramCount}`);
      values.push(manufacturer);
    }
    if (model !== undefined) {
      paramCount++;
      setClauses.push(`model = $${paramCount}`);
      values.push(model);
    }
    if (serial_number !== undefined) {
      paramCount++;
      setClauses.push(`serial_number = $${paramCount}`);
      values.push(serial_number);
    }
    if (purchase_date !== undefined) {
      paramCount++;
      setClauses.push(`purchase_date = $${paramCount}`);
      values.push(purchase_date);
    }
    if (warranty_end_date !== undefined) {
      paramCount++;
      setClauses.push(`warranty_end_date = $${paramCount}`);
      values.push(warranty_end_date);
    }
    if (status !== undefined) {
      paramCount++;
      setClauses.push(`status = $${paramCount}`);
      values.push(status);
    }
    if (criticality !== undefined) {
      paramCount++;
      setClauses.push(`criticality = $${paramCount}`);
      values.push(criticality);
    }

    if (setClauses.length === 0) {
      return Response.json({ error: 'No fields to update' }, { status: 400 });
    }

    // Add updated_at
    paramCount++;
    setClauses.push(`updated_at = $${paramCount}`);
    values.push(new Date().toISOString());

    // Add id for WHERE clause
    paramCount++;
    values.push(id);

    const query = `
      UPDATE equipment 
      SET ${setClauses.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await sql(query, values);

    if (result.length === 0) {
      return Response.json({ error: 'Equipment not found' }, { status: 404 });
    }

    return Response.json({ equipment: result[0] });
  } catch (error) {
    console.error('Error updating equipment:', error);
    if (error.code === '23505') {
      return Response.json({ error: 'Equipment code already exists' }, { status: 400 });
    }
    return Response.json({ error: 'Failed to update equipment' }, { status: 500 });
  }
}

// Delete equipment
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    const result = await sql`
      DELETE FROM equipment 
      WHERE id = ${id}
      RETURNING id
    `;

    if (result.length === 0) {
      return Response.json({ error: 'Equipment not found' }, { status: 404 });
    }

    return Response.json({ message: 'Equipment deleted successfully' });
  } catch (error) {
    console.error('Error deleting equipment:', error);
    return Response.json({ error: 'Failed to delete equipment' }, { status: 500 });
  }
}
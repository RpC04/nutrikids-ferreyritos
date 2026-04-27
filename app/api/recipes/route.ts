import { NextRequest, NextResponse } from 'next/server'
import {
  getRecipes,
  createRecipe,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
} from '@/lib/db/server-actions'
import { verifySession } from '@/lib/auth/session'

export async function GET() {
  try {
    const recipes = await getRecipes()
    return NextResponse.json({ success: true, data: recipes })
  } catch (error) {
    console.error('Error fetching recipes:', error)
    return NextResponse.json({
      success: true,
      data: [],
      message: 'Contenido temporalmente no disponible',
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const recipe = await createRecipe(body)

    return NextResponse.json({ success: true, data: recipe }, { status: 201 })
  } catch (error) {
    console.error('Error creating recipe:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create recipe' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id, ...data } = await request.json()
    const recipe = await updateRecipe(id, data)

    return NextResponse.json({ success: true, data: recipe })
  } catch (error) {
    console.error('Error updating recipe:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update recipe' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing recipe ID' },
        { status: 400 }
      )
    }

    await deleteRecipe(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting recipe:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete recipe' },
      { status: 500 }
    )
  }
}

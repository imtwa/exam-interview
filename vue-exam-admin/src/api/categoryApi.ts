import request from '@/utils/http'
import { PaginationResult, BaseResult } from '@/types/axios'
import { CategoryModel, SubCategoryModel, PaginationParams } from './model/examModels'

// Category management API service
export class CategoryService {
  // Get category list with pagination
  static getCategoryList(params: PaginationParams) {
    const { page, size, searchVal = '' } = params
    return request.get<PaginationResult<CategoryModel[]>>({
      url: `/api/categories?page=${page}&size=${size}&search=${searchVal}`
    })
  }

  // Get all categories (no pagination)
  static getAllCategories() {
    return request.get<BaseResult<CategoryModel[]>>({
      url: '/api/categories/all'
    })
  }

  // Get category detail
  static getCategoryDetail(id: number) {
    return request.get<BaseResult<CategoryModel>>({
      url: `/api/categories/${id}`
    })
  }

  // Add category
  static addCategory(params: CategoryModel) {
    return request.post<BaseResult>({
      url: '/api/categories',
      data: params
    })
  }

  // Edit category
  static updateCategory(id: number, params: CategoryModel) {
    return request.put<BaseResult>({
      url: `/api/categories/${id}`,
      data: params
    })
  }

  // Delete category
  static deleteCategory(id: number) {
    return request.del<BaseResult>({
      url: `/api/categories/${id}`
    })
  }
}

// SubCategory management API service
export class SubCategoryService {
  // Get subcategory list with pagination
  static getSubCategoryList(params: PaginationParams) {
    const { page, size, searchVal = '', categoryId } = params
    return request.get<PaginationResult<SubCategoryModel[]>>({
      url: `/api/subcategories?page=${page}&size=${size}&search=${searchVal}&categoryId=${categoryId || ''}`
    })
  }

  // Get subcategories by category ID
  static getSubCategoriesByCategoryId(categoryId: number) {
    return request.get<BaseResult<SubCategoryModel[]>>({
      url: `/api/subcategories/by-category/${categoryId}`
    })
  }

  // Get subcategory detail
  static getSubCategoryDetail(id: number) {
    return request.get<BaseResult<SubCategoryModel>>({
      url: `/api/subcategories/${id}`
    })
  }

  // Add subcategory
  static addSubCategory(params: SubCategoryModel) {
    return request.post<BaseResult>({
      url: '/api/subcategories',
      data: params
    })
  }

  // Edit subcategory
  static updateSubCategory(id: number, params: SubCategoryModel) {
    return request.put<BaseResult>({
      url: `/api/subcategories/${id}`,
      data: params
    })
  }

  // Delete subcategory
  static deleteSubCategory(id: number) {
    return request.del<BaseResult>({
      url: `/api/subcategories/${id}`
    })
  }
}

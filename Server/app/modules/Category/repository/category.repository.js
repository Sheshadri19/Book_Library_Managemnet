const Category = require('../model/category');

class CategoryRepository {
    async createCategory(categoryData) {
        const newCategory = new Category(categoryData);
        return await newCategory.save();
    }

    async findCategories() {
        return await Category.find();
    }
}

module.exports = new CategoryRepository();

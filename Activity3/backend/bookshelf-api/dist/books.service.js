"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BooksService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const book_entity_1 = require("./entities/book.entity");
let BooksService = class BooksService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    create(payload) {
        const book = this.repo.create({
            title: payload.title,
            author: payload.authorId ? { id: payload.authorId } : null,
            category: payload.categoryId ? { id: payload.categoryId } : null,
            publishedYear: payload.publishedYear,
            isbn: payload.isbn,
            pageCount: payload.pageCount,
            coverUrl: payload.coverUrl,
            plot: payload.plot,
            borrowed: false,
            borrowedDate: null,
        });
        return this.repo.save(book);
    }
    findAll() {
        return this.repo.find({ relations: { author: true, category: true }, order: { createdAt: 'DESC' } });
    }
    async findOne(id) {
        const item = await this.repo.findOne({ where: { id }, relations: { author: true, category: true } });
        if (!item)
            throw new common_1.NotFoundException('Book not found');
        return item;
    }
    async update(id, payload) {
        const book = await this.findOne(id);
        if (payload.title !== undefined)
            book.title = payload.title;
        if (payload.authorId !== undefined)
            book.author = payload.authorId ? { id: payload.authorId } : null;
        if (payload.categoryId !== undefined)
            book.category = payload.categoryId ? { id: payload.categoryId } : null;
        if (payload.publishedYear !== undefined)
            book.publishedYear = payload.publishedYear;
        if (payload.isbn !== undefined)
            book.isbn = payload.isbn;
        if (payload.pageCount !== undefined)
            book.pageCount = payload.pageCount;
        if (payload.coverUrl !== undefined)
            book.coverUrl = payload.coverUrl;
        if (payload.plot !== undefined)
            book.plot = payload.plot;
        return this.repo.save(book);
    }
    async borrow(id) {
        const book = await this.findOne(id);
        book.borrowed = true;
        book.borrowedDate = new Date();
        return this.repo.save(book);
    }
    async return(id) {
        const book = await this.findOne(id);
        book.borrowed = false;
        book.borrowedDate = null;
        return this.repo.save(book);
    }
    async remove(id) {
        const res = await this.repo.delete(id);
        if (!res.affected)
            throw new common_1.NotFoundException('Book not found');
    }
};
exports.BooksService = BooksService;
exports.BooksService = BooksService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(book_entity_1.Book)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], BooksService);
//# sourceMappingURL=books.service.js.map
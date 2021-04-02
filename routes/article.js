const express                   = require('express'),
      router                    = express.Router(),
      Article                   = require('../services/article'),
      multer                    = require('multer')

const {articlePictureUploader}  = require('../tools/uploader')

router.post('/', (req, res) => {
    const uploadArticlePicture = articlePictureUploader.single('article-picture')
    uploadArticlePicture(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            req.flash('error', "مشکلی در ذخیره سازی عکس مقاله بوجود آمده است")
            return res.status(500).redirect('/new')

        } else if (err) {
            req.flash('error', "مشکلی در ذخیره سازی عکس مقاله بوجود آمده است")
            return res.status(500).redirect('/new')
        }
        
        try {
            let inputArticle = req.body,
                newArticle   = await Article.create({
                    title    : inputArticle.title,
                    content  : inputArticle.content,
                    picture  : req.file.filename, 
                    author   : req.session.user._id
                })

            req.flash('message', "مقاله جدید با موفقیت ذخیره شد")
            res.redirect(`/articles/${newArticle._id}`)

        } catch (err) {
            req.flash('error', "مشکلی در ساخت مقاله بوجود آمده است")
            res.status(500).redirect('/new')
        }
    })
})

router.get('/:id', async (req, res) => {
    try {
        let requestedArticleId = req.params.id,
            article = await Article.read(requestedArticleId)

        res.render('article', {msg: req.flash('message'), err: req.flash('error'), article})

    } catch (err) {
        res.status(500).render('article', {msg: req.flash('message'), err: req.flash('error'), article})
    }
})

router.get('/', async (req, res) => {
    try {
        let articles = await Article.readAll({})
        res.render('article--list', {err: req.flash('error'), msg: req.flash('message'), articles})

    } catch (err) {
        req.flash('error', "مشکلی در پیدا کردن لیست مقالات وجود دارد")
        res.status(500).redirect('/dashboard')
    }
})

module.exports = router;
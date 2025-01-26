import multer from 'multer'

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/temp')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname) //future me try karo: we can add filename with some suffix and all b/c it may be user upload many file with same name
    }
  })
  
export const upload = multer({ 
    storage,
})


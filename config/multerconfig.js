import multer from "multer";
import path from "path";
import crypto from "crypto";
//disk storage setup
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/images/uploads')
    },
    filename: function (req, file, cb) {
      crypto.randomBytes(12, function (err, bytes) {
        const fn = bytes.toString('hex') + path.extname(file.originalname);
        cb(null, fn)
      })
      
    }
  })
  
  
//export upload variable
const upload = multer({ storage: storage })

export default upload
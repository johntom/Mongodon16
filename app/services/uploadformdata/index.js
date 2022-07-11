// const concat = require('concat-stream')
//  not used for node 14+ 
// const pump = require('pump')

const multipart = require('@fastify/multipart');

const fs = require('fs-extra')
const util = require('util')
const path = require('path')
const { pipeline } = require('stream')
const pump = util.promisify(pipeline)
// const fileUpload = require('fastify-file-upload')
// const files = req.raw.files
// console.log(files)
// let fileArr = []
// for (let key in files) {
//     fileArr.push({
//         name: files[key].name,
//         mimetype: files[key].mimetype,
//           data:files[key].data,
//     })
// }
// let filename = fileArr[0].name;

const drive = process.env.drive;
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
//https://github.com/fastify/fastify/blob/master/docs/Request.md
module.exports = async function (fastify, opts, next) {


    fastify.register(require('@fastify/multipart'), {
        limits: {
            //         fieldNameSize: 100, // Max field name size in bytes
            //         fieldSize: 100, // Max field value size in bytes
            //         fields: 10,         // Max number of non-file fields
            fileSize: 50000000,      // 30000000 For multipart forms, the max file size 100 = 10 megs
            //         files: 1,           // Max number of file fields
            //         headerPairs: 2000   // Max number of header key=>value pairs
        }
    });


    fastify.post('/:dir/:wcid/:id', async (req, reply) => {

        // path  //D:\Docs\Images\claims\70000(wcid)\payments(dir)\(id)1004078.pdf
        let uploaded = false
        const { dir, wcid, id } = req.params;
        console.log('============================req=/n/r', dir, wcid, id)//req.headers,req.params )




        const data = await req.file()

        data.file // stream
        data.fields // other parsed parts
        data.fieldname
        data.filename
        data.encoding
        data.mimetype

        // to accumulate the file in memory! Be careful!        //
        // await data.toBuffer() // Buffer        //
        // or



        dirval = dir;
        let dirpath
        // let pathcheck = `${drive}:/Docs/images/claims/${dirval}/{id}`
        let pathcheck
        if (dirval === 'payee') {
            // wcid is payeeid
            pathcheck = `${drive}:/Docs/images/payee/${wcid}`
            dirpath = `${drive}:/Docs/Images/payee/${wcid}`

        } else {
            pathcheck = `${drive}:/Docs/images/claims/${dirval}/${id}`
            dirpath = `${drive}:/Docs/Images/claims/${wcid}/${dirval}`
        }

        fs.ensureDir(pathcheck)
            .then(() => {

            })
            .catch(err => {
                console.error(err)
            })


        async function createdir(directory) {
            try {
                await fs.ensureDir(directory)
                console.log('success! ', directory)
            } catch (err) {
                console.error(err)
            }
            return true
        }


        let cd = await createdir(dirpath)

        // let writepath = `e:/Docs/Images/claims/${wcid}/${dirval}/${filename}`
        let writepath = `${dirpath}/${data.filename}`

        console.log(`=========dirpath/filename-/writepath-------${dirpath}/${data.filename}/${writepath}`)//, id, file, filename)

        await sleep(1500)

        await pump(data.file, fs.createWriteStream(writepath))

       
        console.log(`upload writepath ${writepath}`)

        uploaded = true
        console.log(`upload pump ${data.filename}`)
        const dstpath = `${dirpath}/${id}.pdf`
        try {
            //await
            fs.rename(writepath, dstpath)
            console.log('rename success!', writepath, dstpath)
        } catch (err) {
            console.error('err rename file', err)
        }

        // be careful of permission issues on disk and not overwrite ${dirval}
        // sensitive files that could cause security risks

console.log('reply')
         reply.send({data:'upload'})
    })



    // fastify.post('/', (req, reply) => {

    //     console.log('========upload========this is not used============', req.headers)
    //     let uploaded = false
    //     const mp = req.multipart(handler, onEnd)
    //     // mp is an instance of https://www.npmjs.com/package/busboy
    //     let dirval = 0
    //     // check if directory exits passed as part of form
    //     mp.on('field', function (key, value) {
    //         dirval = value;
    //         let pathcheck = `./uploads/${dirval}`
    //         fs.ensureDir(pathcheck)
    //             .then(() => {
    //             })
    //             .catch(err => {
    //                 console.error(err)
    //             })
    //     })
    //     function onEnd(err) {
    //         console.log('upload completed')
    //         // reply.code(200).send()
    //         reply.send({ data: 'upload' })
    //     }
    //     function handler(field, file, filename, encoding, mimetype) {
    //         pump(file, fs.createWriteStream(`${drive}:/clientuploads/${filename}`))
    //         // var file = fs.createWriteStream(`${drive}:/clientuploads/${filename}`)
    //         uploaded = true
    //         console.log('upload pump')
    //         // be careful of permission issues on disk and not overwrite ${dirval}
    //         // sensitive files that could cause security risks
    //     }

    //     next()


    // })

}

module.exports.autoPrefix = '/upload'
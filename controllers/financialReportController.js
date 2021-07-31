const { db, dbQuery } = require('../config')

module.exports = {
    getRevenue: async (req, res, next) => {
        try {
            let role = req.user.role 
            if (role === 'admin') {
                let queryRevenue = `SELECT DATE(date_transaction) AS date, SUM(subtotal_parcel - subtotal_product) as profit, SUM(subtotal_parcel) as user_spent FROM transaction GROUP BY DATE(date_transaction) ORDER BY date`
                let queryTotalRevenue = `SELECT SUM(subtotal_parcel - subtotal_product) as total_revenue FROM transaction`
                let queryCurrentMonthRevenue = `SELECT SUM(subtotal_parcel - subtotal_product) as revenue FROM transaction WHERE MONTH(date_transaction)=MONTH(curdate())`
                let queryCurrentDateRevenue = `SELECT SUM(subtotal_parcel - subtotal_product) as revenue FROM transaction WHERE DATE(date_transaction)=curdate()`
                let queryFilteredRevenue = `SELECT SUM(subtotal_parcel - subtotal_product) as revenue FROM transaction WHERE date_transaction BETWEEN ${db.escape(req.query.from)} AND ${db.escape(req.query.to)}`
                let querytopParcelRevenue = `SELECT idparcel_type, (parcel_type.price - SUM(product.price)) AS parcel_profit FROM db_parcelpanda.transaction_detail JOIN parcel_type ON transaction_detail.idparcel_type = parcel_type.id JOIN product ON transaction_detail.idproduct = product.id GROUP BY idparcel_type ORDER BY parcel_profit DESC`
                let total = await dbQuery(queryTotalRevenue)
                let month = await dbQuery(queryCurrentMonthRevenue)
                let day = await dbQuery(queryCurrentDateRevenue)
                let filtered = await dbQuery(queryFilteredRevenue)
                let data = await dbQuery(queryRevenue)
                let topParcel = await dbQuery(querytopParcelRevenue)
                res.status(200).send({total: total[0].total_revenue, month: month[0].revenue, day: day[0].revenue, filtered: filtered[0].revenue, data: data, top: topParcel})
            } else {
                res.status(400).send({message: "Must be admin"})
            }
        } catch (error) {
            console.log(error)
            next(error)
        }
    },

    getItemReport: async (req, res, next) => {
        try {
            let role = req.user.role 
            if (role === 'admin') {
                let querySalesItem = `SELECT DATE(date_transaction) AS date, SUM(transaction_detail.amount) as amount FROM transaction JOIN transaction_detail ON transaction.id = transaction_detail.idtransaksi GROUP BY DATE(date_transaction) ORDER BY date`
                let queryTotalItem = `SELECT SUM(transaction_detail.amount) as total_product FROM transaction_detail`
                let queryCurrentMonthItem = `SELECT SUM(transaction_detail.amount) as total_product FROM transaction JOIN transaction_detail ON transaction.id = transaction_detail.idtransaksi WHERE MONTH(date_transaction)=MONTH(curdate())`
                let queryCurrentDateItem = `SELECT SUM(transaction_detail.amount) as total_product FROM transaction JOIN transaction_detail ON transaction.id = transaction_detail.idtransaksi WHERE DATE(date_transaction)=curdate()`
                let queryFilteredITem = `SELECT SUM(transaction_detail.amount) as total_product FROM transaction JOIN transaction_detail ON transaction.id = transaction_detail.idtransaksi WHERE date_transaction BETWEEN ${db.escape(req.query.from)} AND ${db.escape(req.query.to)}`
                let querytopCategory = `SELECT title as category, SUM(amount) as total FROM transaction_detail JOIN category ON transaction_detail.idcategory = category.id GROUP BY title`
                let data = await dbQuery(querySalesItem)
                let total = await dbQuery(queryTotalItem)
                let month = await dbQuery(queryCurrentMonthItem)
                let day = await dbQuery(queryCurrentDateItem)
                let filtered = await dbQuery(queryFilteredITem)
                let topCategory = await dbQuery(querytopCategory)
                res.status(200).send({total: total[0].total_product, month: month[0].total_product, day: day[0].total_product, filtered: filtered[0].total_product, data: data, top: topCategory})
            } else {
                res.status(400).send({message: "Must be admin"})
            }
        } catch (error) {
            console.log(error)
            next(error)
        }
    },
}
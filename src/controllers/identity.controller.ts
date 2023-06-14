import { NextFunction, Request, Response } from "express";
import { Identity } from "../entity/identity.entity";
import { AppDataSource } from "../utils/dataSource";
import { ErrorResponse } from "../utils/errorResponse";

export const identity = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let db;
  try {
    const { email, phoneNumber } = req.query;

    if (!email && !phoneNumber)
      return next(
        new ErrorResponse("Either Email or Phone Number is Mandatory", 400)
      );

    db = AppDataSource.createQueryRunner();

    await db.connect();

    await db.startTransaction();

    let sql = `SELECT * FROM identity WHERE `;
    if (!email) sql += `phone_number=${phoneNumber} AND email=NULL`;
    else if (!phoneNumber) sql += `email='${email}' AND phone_number=NULL`;
    else sql += `email='${email}' AND phone_number='${phoneNumber}'`;

    let ret: Identity[] = await db.query(sql);

    if (!ret.length) {
      sql = `SELECT * FROM identity WHERE email='${email}' OR phone_number='${phoneNumber}' ORDER BY link_precedence`;
      ret = await db.query(sql);

      if (!ret.length) {
        sql = `INSERT INTO identity`;
        if (!email)
          sql += `(phone_number,link_precendence) VALUES('${phoneNumber}','Primary')`;
        else if (!phoneNumber)
          sql += `(email,link_precedence) VALUES('${email}','Primary')`;
        else
          sql += `(email,phone_number,link_precedence) VALUES('${email}','${phoneNumber}','Primary')`;

        await db.query(sql);
      } else {
        sql = `INSERT INTO identity`;
        if (!email)
          sql += `(phone_number,link_id,link_precendence) VALUES('${phoneNumber}',${ret[0].id},'Secondary')`;
        else if (!phoneNumber)
          sql += `(email,link_id,link_precedence) VALUES('${email}',${ret[0].id},'Secondary')`;
        else
          sql += `(email,phone_number,link_id,link_precedence) VALUES('${email}','${phoneNumber}',${ret[0].id},'Secondary')`;

        await db.query(sql);
      }
    }

    await db.commitTransaction();

    await db.release();

    return res.status(200).json({ status: true, data: { ret } });
  } catch (err) {
    await db?.rollbackTransaction();
    await db?.release();
    return next(err);
  }
};

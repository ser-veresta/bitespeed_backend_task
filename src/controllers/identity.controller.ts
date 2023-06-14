import { NextFunction, Request, Response } from "express";
import { Identity } from "../entity/identity.entity";
import { AppDataSource } from "../utils/dataSource";
import { ErrorResponse } from "../utils/errorResponse";
import { QueryRunner } from "typeorm";

interface response {
  contact: {
    primaryContactId: number;
    emails: string[];
    phoneNumbers: string[];
    secondaryContactIds: number[];
  };
}

export const identity = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let db: QueryRunner;
  try {
    const { email, phoneNumber } = req.query;

    if (!email && !phoneNumber)
      return next(
        new ErrorResponse("Either Email or Phone Number is Mandatory", 400)
      );

    db = AppDataSource.createQueryRunner();
    try {
      await db.connect();

      await db.startTransaction();

      let sql = `SELECT * FROM identity WHERE `;
      if (!email) sql += `phone_number=${phoneNumber} AND email=NULL`;
      else if (!phoneNumber) sql += `email='${email}' AND phone_number=NULL`;
      else sql += `email='${email}' AND phone_number='${phoneNumber}'`;

      let ret: Identity[] = await db.query(sql);

      if (!ret.length) {
        sql = `SELECT * FROM identity WHERE email='${email}' OR phone_number='${phoneNumber}' ORDER BY link_precedence,created_at`;
        ret = await db.query(sql);

        sql = `SELECT COUNT(id) FROM identity WHERE (email='${email}' OR phone_number='${phoneNumber}') AND link_precedence='Primary'`;
        let primaryCount = await db.query(sql);

        if (!ret.length) {
          sql = `INSERT INTO identity`;
          if (!email)
            sql += `(phone_number,link_precendence) VALUES('${phoneNumber}','Primary')`;
          else if (!phoneNumber)
            sql += `(email,link_precedence) VALUES('${email}','Primary')`;
          else
            sql += `(email,phone_number,link_precedence) VALUES('${email}','${phoneNumber}','Primary')`;

          await db.query(sql);
        } else if (primaryCount[0].count > 1) {
          sql = `UPDATE identity SET link_precedence='Secondary',link_id=${ret[0].id} WHERE id=${ret[1].id}`;

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
      sql = `SELECT * FROM identity WHERE email='${email}' OR phone_number='${phoneNumber}' ORDER BY link_precedence`;
      ret = await db.query(sql);

      let response: response = {
        contact: {
          primaryContactId: 0,
          emails: [],
          phoneNumbers: [],
          secondaryContactIds: [],
        },
      };

      response.contact.primaryContactId = ret[0].id;

      for (let obj of ret) {
        if (obj.email && !response.contact.emails.includes(obj.email))
          response.contact.emails.push(obj.email);
        if (
          obj.phone_number &&
          !response.contact.phoneNumbers.includes(obj.phone_number)
        )
          response.contact.phoneNumbers.push(obj.phone_number);
        if (obj.link_precedence !== "Primary")
          response.contact.secondaryContactIds.push(obj.id);
      }

      await db.commitTransaction();

      await db.release();

      return res.status(200).json({ status: true, data: response });
    } catch (err) {
      await db.rollbackTransaction();
      await db.release();
      return next(err);
    }
  } catch (err) {
    return next(err);
  }
};

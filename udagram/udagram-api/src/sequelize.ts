import { Sequelize } from "sequelize-typescript";
import { config } from "./config/config";

export const sequelize = new Sequelize({
  username: config.username,
  password: config.password,
  database: config.database,
  host: config.host,

  dialect: "postgres",
  // RDS PostgreSQL 18 sets rds.force_ssl=1, so pg_hba offers hostssl
  // only and an unencrypted connection is refused with SQLSTATE 28000.
  // rejectUnauthorized is false because verifying the server certificate
  // would require the RDS CA bundle on every host that connects; the
  // trade-off is recorded in docs/Pipeline_description.md.
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  storage: ":memory:",
});

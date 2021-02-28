import { Connection, createConnection, getConnectionOptions } from 'typeorm'

export default async (): Promise<Connection> => {
  const defaultOptionsOrmConfig = await getConnectionOptions()

  return createConnection(
    Object.assign(defaultOptionsOrmConfig, {
      database: 
        process.env.NODE_ENV === 'test'
        ? './src/database/database.test.sqlite'
        : defaultOptionsOrmConfig.database
    })
  )
}
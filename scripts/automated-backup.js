#!/usr/bin/env node

/**
 * Automated Database Backup Scheduler for SEVIS Portal
 * 
 * This script provides automated backup scheduling and maintenance
 * capabilities for the SEVIS Portal database.
 * 
 * Usage:
 *   node scripts/automated-backup.js [schedule|cleanup|status]
 * 
 * Requirements:
 *   - SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables
 *   - Node.js cron-like scheduling (using node-cron if available)
 */

require('dotenv').config({ path: '.env.local' })
const { backupDatabase, verifyBackup } = require('./backup-database.js')
const fs = require('fs')
const path = require('path')

const backupsDir = path.join(__dirname, '../backups')

// Configuration
const config = {
  // Backup retention policy (in days)
  retentionDays: 30,
  
  // Maximum number of backups to keep
  maxBackups: 10,
  
  // Backup file patterns (updated to match actual timestamp format)
  backupPattern: /^sevis_backup_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}-\d{3}Z\.json$/,
  summaryPattern: /^sevis_backup_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}-\d{3}Z_summary\.txt$/,
  
  // Critical backup before these operations
  criticalOperations: ['db:migrate', 'build', 'deploy']
}

/**
 * Main automated backup function
 */
async function performAutomatedBackup(reason = 'scheduled') {
  console.log(`🤖 Starting automated backup (${reason})...`)
  
  try {
    // Create backup
    const backupFile = await backupDatabase()
    
    if (!backupFile) {
      throw new Error('Backup creation failed')
    }
    
    // Verify backup
    const isValid = await verifyBackup(backupFile)
    
    if (!isValid) {
      throw new Error('Backup verification failed')
    }
    
    // Log successful backup
    await logBackupEvent('success', reason, backupFile)
    
    // Cleanup old backups
    await cleanupOldBackups()
    
    console.log('✅ Automated backup completed successfully')
    return backupFile
    
  } catch (error) {
    console.error('❌ Automated backup failed:', error.message)
    await logBackupEvent('failure', reason, null, error.message)
    throw error
  }
}

/**
 * Cleanup old backup files based on retention policy
 */
async function cleanupOldBackups() {
  console.log('🧹 Cleaning up old backups...')
  
  if (!fs.existsSync(backupsDir)) {
    console.log('No backups directory found, skipping cleanup')
    return
  }
  
  try {
    const files = fs.readdirSync(backupsDir)
    const backupFiles = files.filter(file => 
      config.backupPattern.test(file) || config.summaryPattern.test(file)
    )
    
    // Sort by creation time (newest first)
    const fileStats = backupFiles.map(file => {
      const filePath = path.join(backupsDir, file)
      const stats = fs.statSync(filePath)
      return { file, filePath, mtime: stats.mtime }
    }).sort((a, b) => b.mtime - a.mtime)
    
    const now = new Date()
    let deletedCount = 0
    
    for (const { file, filePath, mtime } of fileStats) {
      const ageInDays = (now - mtime) / (1000 * 60 * 60 * 24)
      const shouldDelete = ageInDays > config.retentionDays || 
                          fileStats.indexOf(fileStats.find(f => f.file === file)) >= config.maxBackups
      
      if (shouldDelete) {
        try {
          fs.unlinkSync(filePath)
          console.log(`🗑️  Deleted old backup: ${file}`)
          deletedCount++
        } catch (error) {
          console.error(`❌ Failed to delete ${file}:`, error.message)
        }
      }
    }
    
    if (deletedCount === 0) {
      console.log('✅ No old backups to clean up')
    } else {
      console.log(`✅ Cleaned up ${deletedCount} old backup files`)
    }
    
  } catch (error) {
    console.error('❌ Backup cleanup failed:', error.message)
  }
}

/**
 * Log backup events for monitoring and debugging
 */
async function logBackupEvent(status, reason, backupFile, errorMessage = null) {
  const logDir = path.join(__dirname, '../logs')
  const logFile = path.join(logDir, 'backup-log.txt')
  
  // Ensure logs directory exists
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true })
  }
  
  const timestamp = new Date().toISOString()
  const logEntry = [
    `[${timestamp}]`,
    `Status: ${status.toUpperCase()}`,
    `Reason: ${reason}`,
    backupFile ? `File: ${path.basename(backupFile)}` : 'File: None',
    errorMessage ? `Error: ${errorMessage}` : '',
    '---'
  ].filter(line => line !== '').join('\n') + '\n'
  
  try {
    fs.appendFileSync(logFile, logEntry)
  } catch (error) {
    console.error('❌ Failed to write backup log:', error.message)
  }
}

/**
 * Get backup status and statistics
 */
async function getBackupStatus() {
  console.log('📊 Backup Status Report\n')
  
  if (!fs.existsSync(backupsDir)) {
    console.log('❌ No backups directory found')
    return
  }
  
  try {
    const files = fs.readdirSync(backupsDir)
    const backupFiles = files.filter(file => config.backupPattern.test(file))
    const summaryFiles = files.filter(file => config.summaryPattern.test(file))
    
    console.log(`📁 Backup Directory: ${backupsDir}`)
    console.log(`📋 Total Backups: ${backupFiles.length}`)
    console.log(`📄 Summary Files: ${summaryFiles.length}`)
    
    if (backupFiles.length > 0) {
      // Find latest backup
      const latestBackup = backupFiles
        .map(file => {
          const filePath = path.join(backupsDir, file)
          const stats = fs.statSync(filePath)
          return { file, mtime: stats.mtime, size: stats.size }
        })
        .sort((a, b) => b.mtime - a.mtime)[0]
      
      console.log(`\n📅 Latest Backup:`)
      console.log(`   File: ${latestBackup.file}`)
      console.log(`   Date: ${latestBackup.mtime.toLocaleString()}`)
      console.log(`   Size: ${(latestBackup.size / 1024 / 1024).toFixed(2)} MB`)
      
      // Calculate total backup size
      const totalSize = backupFiles.reduce((total, file) => {
        const filePath = path.join(backupsDir, file)
        return total + fs.statSync(filePath).size
      }, 0)
      
      console.log(`\n💾 Storage Usage:`)
      console.log(`   Total Size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`)
      console.log(`   Average Size: ${(totalSize / backupFiles.length / 1024 / 1024).toFixed(2)} MB`)
    }
    
    // Check recent log entries
    const logFile = path.join(__dirname, '../logs/backup-log.txt')
    if (fs.existsSync(logFile)) {
      const logContent = fs.readFileSync(logFile, 'utf8')
      const recentEntries = logContent.split('---').slice(-3)
      
      console.log(`\n📝 Recent Backup Activity:`)
      recentEntries.forEach(entry => {
        if (entry.trim()) {
          console.log(entry.trim().replace(/\n/g, '\n   '))
          console.log('')
        }
      })
    }
    
  } catch (error) {
    console.error('❌ Failed to get backup status:', error.message)
  }
}

/**
 * Pre-operation backup hook
 * Can be called before critical operations
 */
async function preOperationBackup(operation) {
  if (!config.criticalOperations.includes(operation)) {
    console.log(`ℹ️  Operation '${operation}' does not require backup`)
    return null
  }
  
  console.log(`🔒 Critical operation detected: ${operation}`)
  console.log('Creating safety backup...')
  
  return await performAutomatedBackup(`pre-${operation}`)
}

/**
 * Command line interface
 */
async function main() {
  const command = process.argv[2] || 'backup'
  
  try {
    switch (command) {
      case 'backup':
      case 'run':
        await performAutomatedBackup('manual')
        break
        
      case 'cleanup':
        await cleanupOldBackups()
        break
        
      case 'status':
        await getBackupStatus()
        break
        
      case 'pre-operation':
        const operation = process.argv[3]
        if (!operation) {
          console.error('❌ Operation name required for pre-operation backup')
          process.exit(1)
        }
        await preOperationBackup(operation)
        break
        
      case 'help':
        console.log(`
🤖 Automated Database Backup Tool

Usage:
  node scripts/automated-backup.js [command]

Commands:
  backup, run       Create a new backup
  cleanup           Remove old backups based on retention policy
  status            Show backup status and statistics
  pre-operation     Create backup before critical operation
  help              Show this help message

Configuration:
  Retention: ${config.retentionDays} days
  Max Backups: ${config.maxBackups}
  Backup Directory: ${path.relative(process.cwd(), backupsDir)}

Examples:
  npm run db:backup-auto
  node scripts/automated-backup.js status
  node scripts/automated-backup.js pre-operation db:migrate
`)
        break
        
      default:
        console.error(`❌ Unknown command: ${command}`)
        console.error('Use "help" for usage information')
        process.exit(1)
    }
    
  } catch (error) {
    console.error(`❌ Command failed:`, error.message)
    process.exit(1)
  }
}

// Export functions for use in other scripts
module.exports = {
  performAutomatedBackup,
  cleanupOldBackups,
  getBackupStatus,
  preOperationBackup,
  config
}

// Run if called directly
if (require.main === module) {
  main()
    .then(() => {
      console.log('🏁 Automated backup script completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Script failed:', error)
      process.exit(1)
    })
}
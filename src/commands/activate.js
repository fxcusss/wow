import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { createLicense, getLicenseByUserId } from '../database.js';
import { generateLicenseKey } from '../utils/keyGenerator.js';
import { Colors } from '../utils/colors.js';

export const data = new SlashCommandBuilder()
  .setName('activate')
  .setDescription('Activate your license and get access to the tweaking utility');

export async function execute(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const userId = interaction.user.id;
  const username = interaction.user.tag;

  const existingLicense = await getLicenseByUserId(userId);
  
  if (existingLicense) {
    const embed = new EmbedBuilder()
      .setColor(Colors.YELLOW)
      .setTitle('⚠️ License Already Activated')
      .setDescription('You have already activated a license for this account.')
      .addFields(
        { name: 'License Key', value: `\`${existingLicense.license_key}\``, inline: true },
        { name: 'Status', value: existingLicense.status === 'active' ? '✅ Active' : '❌ Revoked', inline: true },
        { name: 'Activated', value: `<t:${Math.floor(new Date(existingLicense.activated_at).getTime() / 1000)}:R>`, inline: false }
      )
      .setFooter({ text: 'License Management System' })
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  }

  const licenseKey = generateLicenseKey();
  const license = await createLicense(userId, username, licenseKey);

  if (!license) {
    const errorEmbed = new EmbedBuilder()
      .setColor(Colors.RED)
      .setTitle('❌ Activation Failed')
      .setDescription('An error occurred while creating your license. Please contact an administrator.')
      .setFooter({ text: 'License Management System' })
      .setTimestamp();

    return interaction.editReply({ embeds: [errorEmbed] });
  }

  try {
    const guild = interaction.guild;
    const member = await guild.members.fetch(userId);
    
    let activatedRole = guild.roles.cache.find(role => role.name === 'Licensed User');
    
    if (!activatedRole) {
      activatedRole = await guild.roles.create({
        name: 'Licensed User',
        color: Colors.GREEN,
        reason: 'License activation role'
      });
    }

    await member.roles.add(activatedRole);

    const dmEmbed = new EmbedBuilder()
      .setColor(Colors.GREEN)
      .setTitle('🎉 License Activated Successfully!')
      .setDescription('Your license has been activated. Keep this key safe!')
      .addFields(
        { name: '🔑 License Key', value: `\`\`\`${licenseKey}\`\`\``, inline: false },
        { name: '👤 Account', value: username, inline: true },
        { name: '📅 Activated', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
      )
      .setFooter({ text: 'Do not share this key with anyone!' })
      .setTimestamp();

    await interaction.user.send({ embeds: [dmEmbed] });

    const replyEmbed = new EmbedBuilder()
      .setColor(Colors.GREEN)
      .setTitle('✅ License Activated')
      .setDescription('Your license has been activated successfully! Check your DMs for your license key.')
      .addFields(
        { name: 'Role Assigned', value: activatedRole.toString(), inline: true },
        { name: 'Status', value: '✅ Active', inline: true }
      )
      .setFooter({ text: 'License Management System' })
      .setTimestamp();

    return interaction.editReply({ embeds: [replyEmbed] });

  } catch (error) {
    console.error('Error during activation:', error);
    
    const errorEmbed = new EmbedBuilder()
      .setColor(Colors.YELLOW)
      .setTitle('⚠️ Partial Activation')
      .setDescription('Your license was created but there was an issue with role assignment or sending DM.')
      .addFields(
        { name: '🔑 License Key', value: `\`${licenseKey}\``, inline: false },
        { name: 'Note', value: 'Please ensure your DMs are open and contact an admin if you need the role assigned.', inline: false }
      )
      .setFooter({ text: 'License Management System' })
      .setTimestamp();

    return interaction.editReply({ embeds: [errorEmbed] });
  }
}

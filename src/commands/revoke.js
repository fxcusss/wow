import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { revokeLicense, getLicenseByUserId } from '../database.js';
import { Colors } from '../utils/colors.js';

export const data = new SlashCommandBuilder()
  .setName('revoke')
  .setDescription('Revoke a user\'s license (Admin only)')
  .addUserOption(option =>
    option.setName('user')
      .setDescription('The user whose license to revoke')
      .setRequired(true)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const targetUser = interaction.options.getUser('user');
  const adminId = interaction.user.id;

  const license = await getLicenseByUserId(targetUser.id);

  if (!license) {
    const embed = new EmbedBuilder()
      .setColor(Colors.RED)
      .setTitle('❌ License Not Found')
      .setDescription(`No license found for ${targetUser.tag}.`)
      .setFooter({ text: 'License Management System' })
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  }

  if (license.status === 'revoked') {
    const embed = new EmbedBuilder()
      .setColor(Colors.YELLOW)
      .setTitle('⚠️ Already Revoked')
      .setDescription(`The license for ${targetUser.tag} is already revoked.`)
      .addFields(
        { name: 'Revoked At', value: `<t:${Math.floor(new Date(license.revoked_at).getTime() / 1000)}:F>`, inline: true },
        { name: 'Revoked By', value: `<@${license.revoked_by}>`, inline: true }
      )
      .setFooter({ text: 'License Management System' })
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  }

  const revokedLicense = await revokeLicense(targetUser.id, adminId);

  try {
    const guild = interaction.guild;
    const member = await guild.members.fetch(targetUser.id);
    const licensedRole = guild.roles.cache.find(role => role.name === 'Licensed User');

    if (licensedRole && member.roles.cache.has(licensedRole.id)) {
      await member.roles.remove(licensedRole);
    }
  } catch (error) {
    console.error('Error removing role:', error);
  }

  const embed = new EmbedBuilder()
    .setColor(Colors.RED)
    .setTitle('🔒 License Revoked')
    .setDescription(`Successfully revoked the license for ${targetUser.tag}.`)
    .addFields(
      { name: 'User', value: targetUser.tag, inline: true },
      { name: 'License Key', value: `\`${revokedLicense.license_key}\``, inline: true },
      { name: 'Revoked By', value: interaction.user.tag, inline: true },
      { name: 'Revoked At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
    )
    .setFooter({ text: 'License Management System' })
    .setTimestamp();

  return interaction.editReply({ embeds: [embed] });
}

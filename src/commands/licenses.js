import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { getAllLicenses } from '../database.js';
import { Colors } from '../utils/colors.js';

export const data = new SlashCommandBuilder()
  .setName('licenses')
  .setDescription('View all licenses (Admin only)')
  .addIntegerOption(option =>
    option.setName('page')
      .setDescription('Page number to view')
      .setMinValue(1)
      .setRequired(false)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const page = interaction.options.getInteger('page') || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  const { licenses, total } = await getAllLicenses(limit, offset);
  const totalPages = Math.ceil(total / limit);

  if (licenses.length === 0) {
    const embed = new EmbedBuilder()
      .setColor(Colors.YELLOW)
      .setTitle('📋 License Database')
      .setDescription('No licenses found in the database.')
      .setFooter({ text: 'License Management System' })
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  }

  const embed = new EmbedBuilder()
    .setColor(Colors.BLURPLE)
    .setTitle('📋 License Database')
    .setDescription(`Showing ${licenses.length} of ${total} total licenses`)
    .setFooter({ text: `Page ${page} of ${totalPages} | License Management System` })
    .setTimestamp();

  licenses.forEach(license => {
    const statusEmoji = license.status === 'active' ? '✅' : '❌';
    const statusText = license.status === 'active' ? 'Active' : 'Revoked';
    
    const fieldValue = [
      `**Key:** \`${license.license_key}\``,
      `**Status:** ${statusEmoji} ${statusText}`,
      `**Activated:** <t:${Math.floor(new Date(license.activated_at).getTime() / 1000)}:R>`,
      license.revoked_at ? `**Revoked:** <t:${Math.floor(new Date(license.revoked_at).getTime() / 1000)}:R> by <@${license.revoked_by}>` : ''
    ].filter(Boolean).join('\n');

    embed.addFields({
      name: `👤 ${license.username}`,
      value: fieldValue,
      inline: false
    });
  });

  return interaction.editReply({ embeds: [embed] });
}

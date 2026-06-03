import { Page, Text, View, Document, StyleSheet, Image, Link } from '@react-pdf/renderer';
import type { ValidatedTrip } from '../lib/trip-schema';

// Colors based on WrapUP branding
const colors = {
  primary: '#0f172a', // Slate 900
  secondary: '#334155', // Slate 700
  accent: '#3b82f6', // Blue 500
  text: '#1e293b',
  textLight: '#64748b',
  border: '#e2e8f0',
  background: '#ffffff',
  surface: '#f8fafc',
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    backgroundColor: colors.background,
    color: colors.text,
  },
  coverPage: {
    padding: 40,
    fontFamily: 'Helvetica',
    backgroundColor: colors.background,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  branding: {
    fontSize: 42,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 16,
    color: colors.textLight,
    marginBottom: 60,
  },
  destinationTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  coverMeta: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 20,
    marginBottom: 60,
  },
  metaBadge: {
    padding: '8px 16px',
    backgroundColor: colors.surface,
    borderRadius: 8,
    border: `1px solid ${colors.border}`,
  },
  metaText: {
    fontSize: 14,
    color: colors.secondary,
  },
  dateText: {
    fontSize: 12,
    color: colors.textLight,
    position: 'absolute',
    bottom: 40,
  },
  
  // Generic sections
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 16,
    borderBottom: `2px solid ${colors.border}`,
    paddingBottom: 8,
    marginTop: 20,
  },
  paragraph: {
    fontSize: 12,
    lineHeight: 1.6,
    color: colors.secondary,
    marginBottom: 12,
  },
  
  // Layouts
  row: {
    display: 'flex',
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  column: {
    flex: 1,
  },
  
  // Cards
  card: {
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    border: `1px solid ${colors.border}`,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 8,
  },
  cardImage: {
    width: '100%',
    height: 120,
    objectFit: 'cover',
    borderRadius: 8,
    marginBottom: 10,
  },
  
  // Itinerary
  dayHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.accent,
    marginTop: 20,
    marginBottom: 12,
    backgroundColor: colors.surface,
    padding: '10px 16px',
    borderRadius: 8,
  },
  timelineItem: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 16,
    paddingLeft: 10,
    borderLeft: `2px solid ${colors.accent}`,
    marginLeft: 10,
  },
  timeCol: {
    width: 60,
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.accent,
  },
  contentCol: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  itemDesc: {
    fontSize: 11,
    color: colors.secondary,
    lineHeight: 1.4,
  },
  itemImage: {
    width: 150,
    height: 100,
    objectFit: 'cover',
    borderRadius: 8,
    marginTop: 8,
  },

  // Lists
  listItem: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 6,
  },
  bullet: {
    width: 15,
    fontSize: 12,
    color: colors.accent,
  },
  listText: {
    flex: 1,
    fontSize: 12,
    color: colors.secondary,
    lineHeight: 1.4,
  },

  // Final Page
  qrContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  qrCode: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  linkText: {
    fontSize: 12,
    color: colors.accent,
    textDecoration: 'underline',
  }
});

interface TripPDFProps {
  trip: ValidatedTrip;
  chartImage?: string;
  qrCodeImage?: string;
  tripUrl?: string;
}

export const TripPDF = ({ trip, chartImage, qrCodeImage, tripUrl }: TripPDFProps) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Document>
      {/* PAGE 1: COVER */}
      <Page size="A4" style={styles.coverPage}>
        <Text style={styles.branding}>WrapUP</Text>
        <Text style={styles.tagline}>Your Personal AI Travel Planner</Text>
        
        <Text style={styles.destinationTitle}>{trip.destination}</Text>
        
        <View style={styles.coverMeta}>
          <View style={styles.metaBadge}>
            <Text style={styles.metaText}>{trip.duration} Days</Text>
          </View>
          <View style={styles.metaBadge}>
            <Text style={styles.metaText}>{trip.travelers} Travelers</Text>
          </View>
          <View style={styles.metaBadge}>
            <Text style={styles.metaText}>{trip.total_budget.toLocaleString()} {trip.currency}</Text>
          </View>
        </View>

        <Text style={styles.dateText}>Generated on {currentDate}</Text>
      </Page>

      {/* PAGE 2: SUMMARY & BUDGET */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Trip Summary</Text>
        <Text style={styles.paragraph}>{trip.trip_summary}</Text>

        <Text style={styles.sectionTitle}>Trip Highlights</Text>
        {trip.highlights.map((h, i) => (
          <View key={i} style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.listText}>{h}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Budget Breakdown</Text>
        {chartImage ? (
          <Image src={chartImage} style={{ width: '100%', height: 300, objectFit: 'contain' }} />
        ) : (
          <View>
            {trip.budget_breakdown.map((b, i) => (
              <View key={i} style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>{b.name}: {b.value.toLocaleString()} {trip.currency}</Text>
              </View>
            ))}
          </View>
        )}
      </Page>

      {/* PAGE 3: ITINERARY */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Daily Itinerary</Text>
        {trip.daily_itinerary.map((day) => (
          <View key={day.day} wrap={false}>
            <Text style={styles.dayHeader}>
              Day {day.day}: {day.title} {day.location ? `— ${day.location}` : ''}
            </Text>
            
            {day.items.map((item, i) => (
              <View key={i} style={styles.timelineItem} wrap={false}>
                <Text style={styles.timeCol}>{item.time}</Text>
                <View style={styles.contentCol}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemDesc}>{item.desc}</Text>
                  {item.photoUrl && (
                    <Image src={item.photoUrl} style={styles.itemImage} />
                  )}
                </View>
              </View>
            ))}
          </View>
        ))}
      </Page>

      {/* PAGE 4: HOTELS & RESTAURANTS */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Recommended Hotels</Text>
        <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {trip.hotels.map((hotel, i) => (
            <View key={i} style={[styles.card, { width: '48%' }]} wrap={false}>
              {hotel.photoUrl && (
                <Image src={hotel.photoUrl} style={styles.cardImage} />
              )}
              <Text style={styles.cardTitle}>{hotel.name}</Text>
              <Text style={styles.cardSubtitle}>
                {hotel.rating}★ • {hotel.price} • {hotel.area}
              </Text>
              {hotel.address && (
                <Text style={styles.paragraph}>{hotel.address}</Text>
              )}
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Food Recommendations</Text>
        <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {trip.food_recommendations.map((food, i) => (
            <View key={i} style={[styles.card, { width: '48%' }]} wrap={false}>
              {food.photoUrl && (
                <Image src={food.photoUrl} style={styles.cardImage} />
              )}
              <Text style={styles.cardTitle}>{food.name}</Text>
              <Text style={styles.paragraph}>{food.desc}</Text>
            </View>
          ))}
        </View>
      </Page>

      {/* PAGE 5: TRANSPORT & TIPS */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Transportation</Text>
        {trip.transportation.map((trans, i) => (
          <View key={i} style={styles.card} wrap={false}>
            <Text style={styles.cardTitle}>{trans.mode} • {trans.cost}</Text>
            <Text style={styles.paragraph}>{trans.detail}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Travel Tips</Text>
        {trip.travel_tips.map((tip, i) => (
          <View key={i} style={styles.listItem} wrap={false}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.listText}>{tip}</Text>
          </View>
        ))}

        {trip.weather && trip.weather.length > 0 && (
          <View wrap={false}>
            <Text style={styles.sectionTitle}>Expected Weather</Text>
            {trip.weather.map((w, i) => (
              <View key={i} style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>
                  {w.day}: {w.cond} (High: {w.high}° / Low: {w.low}°)
                </Text>
              </View>
            ))}
          </View>
        )}
      </Page>

      {/* PAGE 6: QR CODE */}
      {qrCodeImage && (
        <Page size="A4" style={styles.coverPage}>
          <Text style={styles.branding}>WrapUP</Text>
          <Text style={styles.destinationTitle}>Have a great trip!</Text>
          
          <View style={styles.qrContainer}>
            <Image src={qrCodeImage} style={styles.qrCode} />
            {tripUrl && (
              <Link src={tripUrl} style={styles.linkText}>
                View Digital Trip Online
              </Link>
            )}
          </View>
        </Page>
      )}
    </Document>
  );
};

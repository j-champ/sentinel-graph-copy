import { PortNodeDefinition } from '../types';

// Exact canonical ports matching SentinelGraph SpatioTemporalGNN (src/graph/build_temporal_graphs.py)
export const CANONICAL_PORTS: PortNodeDefinition[] = [
  { id: 0, port: 80, name: 'HTTP', service: 'Web Service', protocol: 'TCP', description: 'HyperText Transfer Protocol (cleartext web traffic)', x: 6.0, y: 0.0, z: 0.0 },
  { id: 1, port: 53, name: 'DNS', service: 'Domain Name System', protocol: 'UDP', description: 'Name resolution service and query transport', x: 5.5, y: 0.0, z: 2.3 },
  { id: 2, port: 443, name: 'HTTPS', service: 'Secure Web', protocol: 'TCP', description: 'Encrypted TLS/SSL web application channels', x: 4.2, y: 0.0, z: 4.2 },
  { id: 3, port: 21, name: 'FTP', service: 'File Transfer', protocol: 'TCP', description: 'File Transfer Protocol command and control channel', x: 2.3, y: 0.0, z: 5.5 },
  { id: 4, port: 3389, name: 'RDP', service: 'Remote Desktop', protocol: 'TCP', description: 'Microsoft Remote Desktop Protocol endpoint', x: 0.0, y: 0.0, z: 6.0 },
  { id: 5, port: 22, name: 'SSH', service: 'Secure Shell', protocol: 'TCP', description: 'Encrypted remote terminal administration channel', x: -2.3, y: 0.0, z: 5.5 },
  { id: 6, port: 445, name: 'SMB', service: 'Windows Sharing', protocol: 'TCP', description: 'Server Message Block file/printer sharing', x: -4.2, y: 0.0, z: 4.2 },
  { id: 7, port: 0, name: 'ICMP/RAW', service: 'Raw IP / Control', protocol: 'IP', description: 'Reserved port / Direct IP transport & ICMP diagnostics', x: -5.5, y: 0.0, z: 2.3 },
  { id: 8, port: 5355, name: 'LLMNR', service: 'Local Name Resolv', protocol: 'UDP', description: 'Link-Local Multicast Name Resolution protocol', x: -6.0, y: 0.0, z: 0.0 },
  { id: 9, port: 3128, name: 'SQUID', service: 'HTTP Proxy', protocol: 'TCP', description: 'Web caching proxy daemon traffic', x: -5.5, y: 0.0, z: -2.3 },
  { id: 10, port: 137, name: 'NETBIOS-NS', service: 'NetBIOS Name', protocol: 'UDP', description: 'Legacy Windows NetBIOS Name Service', x: -4.2, y: 0.0, z: -4.2 },
  { id: 11, port: 67, name: 'DHCP', service: 'DHCP Server', protocol: 'UDP', description: 'Dynamic Host Configuration Protocol server broadcast', x: -2.3, y: 0.0, z: -5.5 },
  { id: 12, port: 138, name: 'NETBIOS-DGM', service: 'NetBIOS Datagram', protocol: 'UDP', description: 'NetBIOS Datagram distribution service', x: 0.0, y: 0.0, z: -6.0 },
  { id: 13, port: 500, name: 'ISAKMP', service: 'IPsec Key Exch', protocol: 'UDP', description: 'Internet Security Association Key Management Protocol', x: 2.3, y: 0.0, z: -5.5 },
  { id: 14, port: 135, name: 'MSRPC', service: 'RPC Endpoint', protocol: 'TCP', description: 'Microsoft RPC Endpoint Mapper & DCOM service', x: 4.2, y: 0.0, z: -4.2 },
  { id: 15, port: 'OTHER', name: 'EPHEMERAL', service: 'Dynamic/High Ports', protocol: 'DYNAMIC', description: 'Aggregated high and non-standard network service ports', x: 5.5, y: 0.0, z: -2.3 },
];

export const PORT_MAP: Record<number | string, PortNodeDefinition> = CANONICAL_PORTS.reduce((acc, node) => {
  acc[node.port] = node;
  return acc;
}, {} as Record<number | string, PortNodeDefinition>);
